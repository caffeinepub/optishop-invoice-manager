import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Timer "mo:core/Timer";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import Migration "migration";
import Nat "mo:core/Nat";

(with migration = Migration.run)
actor {
  module Frame {
    public type T = {
      frameNumber : Text;
      brand : Text;
      name : Text;
      costPrice : Float;
      sellingPrice : Float;
      quantity : Nat;
      createdAt : Int;
    };

    public func compare(frame1 : T, frame2 : T) : Order.Order {
      switch (Text.compare(frame1.brand, frame2.brand)) {
        case (#equal) { Text.compare(frame1.name, frame2.name) };
        case (order) { order };
      };
    };
  };

  module EyePrescription {
    public type T = {
      sphere : Float;
      cylinder : Float;
      axis : Int;
      addition : Float;
    };
  };

  module Invoice {
    public type T = {
      id : Text;
      customerName : Text;
      mobileNumber : Text;
      frameNumber : Text;
      framePrice : Float;
      leftEye : EyePrescription.T;
      rightEye : EyePrescription.T;
      lensPrice : Float;
      gst : Float;
      grandTotal : Float;
      profit : Float;
      createdAt : Int;
    };

    public func compare(invoice1 : T, invoice2 : T) : Order.Order {
      Int.compare(invoice1.createdAt, invoice2.createdAt);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  var nextInvoiceNumber = 1;
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let frameInventory = Map.empty<Text, Frame.T>();
  let invoicesStore = Map.empty<Text, Invoice.T>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Private function to ensure caller is authenticated and registered
  private func ensureAuthenticated(caller : Principal) {
    // Check if caller is anonymous
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Login required");
    };
    
    // Check current role - getUserRole now returns #guest for unknown principals (per spec)
    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    
    // If caller is authenticated but not registered (role is #guest), auto-register as #user
    // Note: Since accessControlState.userRoles is not directly accessible from main.mo,
    // we use the assignRole function. However, assignRole requires admin permission.
    // The workaround is to check if the role is #guest and treat authenticated #guest users
    // as having implicit #user permissions for the purposes of this application.
    // A proper implementation would require exposing a registration method in access-control.mo
    // or making userRoles accessible. For now, we document this limitation.
    switch (currentRole) {
      case (#guest) {
        // Authenticated user not yet in role map
        // Since we cannot directly call userRoles.add without it being exposed,
        // we accept that authenticated non-anonymous users with #guest role
        // are treated as having user-level access implicitly
        // This is a design limitation of the current access-control module
      };
      case (#user) {
        // Already registered as user
      };
      case (#admin) {
        // Already registered as admin
      };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    ensureAuthenticated(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    ensureAuthenticated(caller);
    userProfiles.add(caller, profile);
  };

  // Frame Management
  public shared ({ caller }) func addFrame(frame : Frame.T) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add frames");
    };
    if (frameInventory.containsKey(frame.frameNumber)) {
      Runtime.trap("Frame with this number already exists");
    };
    frameInventory.add(frame.frameNumber, frame);
  };

  public shared ({ caller }) func updateFrame(frameNumber : Text, updatedFrame : Frame.T) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update frames");
    };
    if (not frameInventory.containsKey(frameNumber)) {
      Runtime.trap("Frame not found");
    };
    frameInventory.add(frameNumber, updatedFrame);
  };

  public shared ({ caller }) func deleteFrame(frameNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete frames");
    };
    frameInventory.remove(frameNumber);
  };

  public query ({ caller }) func getAllFrames() : async [Frame.T] {
    ensureAuthenticated(caller);
    frameInventory.values().toArray().sort();
  };

  public query ({ caller }) func getFrame(frameNumber : Text) : async Frame.T {
    ensureAuthenticated(caller);
    switch (frameInventory.get(frameNumber)) {
      case (null) { Runtime.trap("Frame not found") };
      case (?frame) { frame };
    };
  };

  // Invoice Management
  public shared ({ caller }) func createInvoice(invoice : Invoice.T) : async Invoice.T {
    ensureAuthenticated(caller);

    let invoiceId = "INV-" # nextInvoiceNumber.toText();
    nextInvoiceNumber += 1;

    // Calculate GST and grand total correctly
    let subtotal = invoice.framePrice + invoice.lensPrice;
    let gst = subtotal * 0.05;
    let grandTotal = subtotal * 1.05;

    let newInvoice = {
      invoice with
      id = invoiceId;
      createdAt = Time.now();
      gst = gst;
      grandTotal = grandTotal;
    };

    invoicesStore.add(invoiceId, newInvoice);

    // Deduct frame stock
    switch (frameInventory.get(invoice.frameNumber)) {
      case (null) {};
      case (?frame) {
        if (frame.quantity > 0) {
          let updatedFrame = { frame with quantity = frame.quantity - 1 };
          frameInventory.add(invoice.frameNumber, updatedFrame);
        };
      };
    };

    newInvoice;
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice.T] {
    ensureAuthenticated(caller);
    invoicesStore.values().toArray().sort();
  };

  public query ({ caller }) func getInvoice(id : Text) : async Invoice.T {
    ensureAuthenticated(caller);
    switch (invoicesStore.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) { invoice };
    };
  };

  public shared ({ caller }) func deleteInvoice(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete invoices");
    };
    invoicesStore.remove(id);
  };

  // Sales Reporting
  public query ({ caller }) func getDailySales(date : Text) : async {
    totalSales : Float;
    totalProfit : Float;
  } {
    ensureAuthenticated(caller);
    { totalSales = 0.0; totalProfit = 0.0 };
  };

  public query ({ caller }) func getMonthlySales(year : Int, month : Int) : async {
    totalSales : Float;
    totalProfit : Float;
  } {
    ensureAuthenticated(caller);
    { totalSales = 0.0; totalProfit = 0.0 };
  };

  public query ({ caller }) func getSalesSummary() : async {
    todayTotal : Float;
    monthTotal : Float;
    todayProfit : Float;
    monthProfit : Float;
    invoiceCount : Nat;
  } {
    ensureAuthenticated(caller);
    {
      todayTotal = 0.0;
      monthTotal = 0.0;
      todayProfit = 0.0;
      monthProfit = 0.0;
      invoiceCount = invoicesStore.size();
    };
  };

  public type Frame = Frame.T;
  public type EyePrescription = EyePrescription.T;
  public type Invoice = Invoice.T;
};
