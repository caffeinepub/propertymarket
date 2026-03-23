import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    email : Text;
    name : Text;
  };

  type PropertyListing = {
    id : Nat;
    ownerId : Principal;
    ownerEmail : Text;
    title : Text;
    description : Text;
    price : Nat;
    propertyType : Text;
    location : Text;
    mediaIds : [Text];
    createdAt : Int;
  };

  module PropertyListing {
    public func compare(a : PropertyListing, b : PropertyListing) : Order.Order {
      Nat.compare(b.id, a.id);
    };
  };

  let listings = Map.empty<Nat, PropertyListing>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextListingId = 0;

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Property listing functions
  public query ({ caller }) func getAllListings() : async [PropertyListing] {
    listings.values().toArray().sort();
  };

  public query ({ caller }) func getMyListings() : async [PropertyListing] {
    let myListings = listings.values().filter(
      func(listing) {
        listing.ownerId == caller
      }
    );
    myListings.toArray();
  };

  public query ({ caller }) func getListing(id : Nat) : async PropertyListing {
    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };
  };

  public shared ({ caller }) func createListing(listing : PropertyListing) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    let newListing : PropertyListing = {
      listing with
      id = nextListingId;
      ownerId = caller;
      createdAt = Time.now();
    };

    listings.add(nextListingId, newListing);
    nextListingId += 1;
    newListing.id;
  };

  public shared ({ caller }) func deleteListing(id : Nat) : async () {
    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can delete this listing");
        };
        listings.remove(id);
      };
    };
  };
};
