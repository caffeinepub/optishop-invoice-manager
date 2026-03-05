import Map "mo:core/Map";
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

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
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
    frameInventory.values().toArray().sort();
  };

  public query ({ caller }) func getFrame(frameNumber : Text) : async Frame.T {
    switch (frameInventory.get(frameNumber)) {
      case (null) { Runtime.trap("Frame not found") };
      case (?frame) { frame };
    };
  };

  // Invoice Management
  public shared ({ caller }) func createInvoice(invoice : Invoice.T) : async Invoice.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create invoices");
    };

    let invoiceId = "INV-" # nextInvoiceNumber.toText();
    nextInvoiceNumber += 1;

    let newInvoice = {
      invoice with
      id = invoiceId;
      createdAt = Time.now();
      gst = invoice.grandTotal * 0.05;
      grandTotal = invoice.grandTotal * 1.05;
    };

    invoicesStore.add(invoiceId, newInvoice);

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view invoices");
    };
    invoicesStore.values().toArray().sort();
  };

  public query ({ caller }) func getInvoice(id : Text) : async Invoice.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view invoices");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view sales reports");
    };
    { totalSales = 0.0; totalProfit = 0.0 };
  };

  public query ({ caller }) func getMonthlySales(year : Int, month : Int) : async {
    totalSales : Float;
    totalProfit : Float;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view sales reports");
    };
    { totalSales = 0.0; totalProfit = 0.0 };
  };

  public query ({ caller }) func getSalesSummary() : async {
    todayTotal : Float;
    monthTotal : Float;
    todayProfit : Float;
    monthProfit : Float;
    invoiceCount : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view sales summary");
    };
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
