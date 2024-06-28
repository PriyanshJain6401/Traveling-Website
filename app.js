const express= require("express");
const app= express();
const mongoose= require("mongoose");
const Listing= require("./models/listing.js");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const wrapAsync= require("./utils/WrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review= require("./models/reviews.js");

const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";

main()
.then((res)=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log("Error in connecting");
})

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const validateListing= (req,res,next)=>{
    let {error}= listingSchema.validate(req.body);
   if(error){
    let errMsg= err.details.map((el)=>el.message).join(",");
    throw new ExpressError(404,errMsg);
   }
   next();
}

const validateReview= (req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
   if(error){
    let errMsg= err.details.map((el)=>el.message).join(",");
    throw new ExpressError(404,errMsg);
   }
   next();
}

//Reviews Post Route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
  }));



//Index Route
app.get("/listings",async (req,res)=>{
    const allListings= await Listing.find({});
    // console.log(allListings)
    res.render("listings/index.ejs",{allListings});
});

//New Route
app.get("/listings/new", (req,res)=>{
    
    res.render("listings/new.ejs");
    });

//Create Route
app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
   let result= listingSchema.validate(req.body);
   console.log(result);
    const newListing= new Listing(req.body.listing);
     await newListing.save();
     res.redirect("/listings");   
}));

//Show Route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id).populate("reviews");  
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}));

//Edit Route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id); 
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    console.log("Inside delete");
    let{id,reviewId}= req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listing/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}= req.params;
   let deletedListing= await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   res.redirect("/listings");
}));

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500 , message="somthing went wrong !"}=err;
    // res.status(statusCode).send(err.message);
    res.status(statusCode).render("error.ejs",{err});
});




app.listen(3000,()=>{
    console.log("Server is Listening to port 3000");
});


