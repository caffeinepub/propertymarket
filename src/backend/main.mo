import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Run "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  type Stats = {
    totalUsers : Nat;
    totalListings : Nat;
  };

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

  public type Inquiry = {
    id : Nat;
    listingId : Nat;
    buyerName : Text;
    buyerPhone : Text;
    message : Text;
    timestamp : Int;
  };

  public type Ad = {
    id : Nat;
    title : Text;
    imageUrl : Text;
    linkUrl : Text;
    isActive : Bool;
    createdAt : Int;
  };

  let listings = Map.empty<Nat, PropertyListing>();
  let inquiries = Map.empty<Nat, Inquiry>();
  let ads = Map.empty<Nat, Ad>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let savedListings = Map.empty<Principal, [Nat]>();

  var nextListingId = 0;
  var nextInquiryId = 0;
  var nextAdId = 0;

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Run.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Run.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Run.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Property listing functions
  public query ({ caller }) func getAllListings() : async [PropertyListing] {
    listings.values().toArray().sort();
  };

  public query ({ caller }) func getMyListings() : async [PropertyListing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Run.trap("Unauthorized: Only users can view their listings");
    };
    let myListings = listings.values().filter(
      func(listing) {
        listing.ownerId == caller
      }
    );
    myListings.toArray();
  };

  public query ({ caller }) func getListing(id : Nat) : async PropertyListing {
    switch (listings.get(id)) {
      case (null) { Run.trap("Listing not found") };
      case (?listing) { listing };
    };
  };

  public shared ({ caller }) func createListing(listing : PropertyListing) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Run.trap("Unauthorized: Only users can create listings");
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

  public shared ({ caller }) func updateListing(listingId : Nat, title : Text, description : Text, price : Nat, propertyType : Text, location : Text, mediaIds : [Text]) : async () {
    switch (listings.get(listingId)) {
      case (null) { Run.trap("Listing not found") };
      case (?listing) {
        if (listing.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Run.trap("Unauthorized: Only the owner can update this listing");
        };
        let updatedListing = {
          listing with
          title;
          description;
          price;
          propertyType;
          location;
          mediaIds;
        };
        listings.add(listingId, updatedListing);
      };
    };
  };

  public shared ({ caller }) func deleteListing(id : Nat) : async () {
    switch (listings.get(id)) {
      case (null) { Run.trap("Listing not found") };
      case (?listing) {
        if (listing.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Run.trap("Unauthorized: Only the owner or an admin can delete this listing");
        };
        listings.remove(id);
      };
    };
  };

  // Helper: check if array contains a Nat value
  func natArrayContains(arr : [Nat], val : Nat) : Bool {
    for (id in arr.vals()) {
      if (id == val) return true;
    };
    false;
  };

  // Save / Unsave listing functions
  public shared ({ caller }) func saveListing(listingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Run.trap("Unauthorized: Only users can save listings");
    };
    let current = switch (savedListings.get(caller)) {
      case (null) { [] };
      case (?ids) { ids };
    };
    if (not natArrayContains(current, listingId)) {
      let updated = current.concat([listingId]);
      savedListings.add(caller, updated);
    };
  };

  public shared ({ caller }) func unsaveListing(listingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Run.trap("Unauthorized: Only users can unsave listings");
    };
    let current = switch (savedListings.get(caller)) {
      case (null) { [] };
      case (?ids) { ids };
    };
    let updated = current.filter(func(id : Nat) : Bool { id != listingId });
    savedListings.add(caller, updated);
  };

  public query ({ caller }) func getSavedListings() : async [PropertyListing] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Run.trap("Unauthorized: Only users can view saved listings");
    };
    let ids = switch (savedListings.get(caller)) {
      case (null) { [] };
      case (?ids) { ids };
    };
    ids.filterMap(func(id : Nat) : ?PropertyListing { listings.get(id) });
  };

  public query ({ caller }) func isListingSaved(listingId : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return false;
    };
    let ids = switch (savedListings.get(caller)) {
      case (null) { [] };
      case (?ids) { ids };
    };
    natArrayContains(ids, listingId);
  };

  // Inquiry functions
  public shared ({ caller }) func submitInquiry(listingId : Nat, buyerName : Text, buyerPhone : Text, message : Text) : async Nat {
    let newInquiry : Inquiry = {
      id = nextInquiryId;
      listingId;
      buyerName;
      buyerPhone;
      message;
      timestamp = Time.now();
    };

    inquiries.add(nextInquiryId, newInquiry);
    nextInquiryId += 1;
    newInquiry.id;
  };

  public query ({ caller }) func getInquiriesForListing(listingId : Nat) : async [Inquiry] {
    let listing = switch (listings.get(listingId)) {
      case (null) { Run.trap("Listing not found") };
      case (?listing) { listing };
    };

    if (listing.ownerId != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
      Run.trap("Unauthorized: Only the owner or an admin can view inquiries");
    };

    let listingInquiries = inquiries.values().filter(
      func(inquiry) {
        inquiry.listingId == listingId
      }
    );
    listingInquiries.toArray();
  };

  // Ad functions
  public shared ({ caller }) func createAd(title : Text, imageUrl : Text, linkUrl : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Run.trap("Unauthorized: Only admins can create ads");
    };

    let newAd : Ad = {
      id = nextAdId;
      title;
      imageUrl;
      linkUrl;
      isActive = true;
      createdAt = Time.now();
    };

    ads.add(nextAdId, newAd);
    nextAdId += 1;
    newAd.id;
  };

  public shared ({ caller }) func updateAd(adId : Nat, title : Text, imageUrl : Text, linkUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Run.trap("Unauthorized: Only admins can update ads");
    };

    let existingAd = switch (ads.get(adId)) {
      case (null) { Run.trap("Ad not found") };
      case (?ad) { ad };
    };

    let updatedAd : Ad = {
      existingAd with
      title;
      imageUrl;
      linkUrl;
    };

    ads.add(adId, updatedAd);
  };

  public shared ({ caller }) func toggleAdActiveState(adId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Run.trap("Unauthorized: Only admins can toggle ad state");
    };

    let ad = switch (ads.get(adId)) {
      case (null) { Run.trap("Ad not found") };
      case (?ad) { ad };
    };

    let updatedAd : Ad = {
      ad with
      isActive = not ad.isActive;
    };

    ads.add(adId, updatedAd);
  };

  public query ({ caller }) func getActiveAds() : async [Ad] {
    let activeAds = ads.values().filter(
      func(ad) {
        ad.isActive
      }
    );
    activeAds.toArray();
  };

  public query ({ caller }) func getAllAds() : async [Ad] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Run.trap("Unauthorized: Only admins can view all ads");
    };
    ads.values().toArray();
  };

  // Global stats function
  public query ({ caller }) func getGlobalStats() : async {
    totalUsers : Nat;
    totalListings : Nat;
  } {
    {
      totalUsers = userProfiles.size();
      totalListings = listings.size();
    };
  };
};
