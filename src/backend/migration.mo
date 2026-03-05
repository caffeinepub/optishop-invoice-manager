import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

module {
  type Frame = {
    frameNumber : Text;
    brand : Text;
    name : Text;
    costPrice : Float;
    sellingPrice : Float;
    quantity : Nat;
    createdAt : Int;
  };

  type EyePrescription = {
    sphere : Float;
    cylinder : Float;
    axis : Int;
    addition : Float;
  };

  type Invoice = {
    id : Text;
    customerName : Text;
    mobileNumber : Text;
    frameNumber : Text;
    framePrice : Float;
    leftEye : EyePrescription;
    rightEye : EyePrescription;
    lensPrice : Float;
    gst : Float;
    grandTotal : Float;
    profit : Float;
    createdAt : Int;
  };

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    frameInventory : Map.Map<Text, Frame>;
    invoicesStore : Map.Map<Text, Invoice>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextInvoiceNumber : Nat;
  };

  type NewActor = {
    frameInventory : Map.Map<Text, Frame>;
    invoicesStore : Map.Map<Text, Invoice>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextInvoiceNumber : Nat;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
