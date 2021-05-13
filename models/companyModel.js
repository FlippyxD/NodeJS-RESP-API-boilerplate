import mongoose from "mongoose";
import slugify from "slugify";
import geocoder from "../utils/geocoder.js";

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
            trim: true,
            maxlength: [50, "Name can not be more than 50 characters"],
        },
        slug: {
            type: String,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: [500, "Name can not be more than 500 characters"],
        },
        website: {
            type: String,
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                "Please use a valid URL with HTTP or HTTPS",
            ],
        },
        phone: {
            type: String,
            maxlength: [20, "Phone number can not be longer than 20 characters"],
        },
        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email",
            ],
        },
        address: {
            type: String,
            required: [true, "Please add an address"],
        },
        location: {
            // GeoJSON Point
            type: {
                type: String,
                enum: ["Point"],
            },
            coordinates: {
                type: [Number],
                index: "2dsphere",
            },
            formattedAddress: {
                type: String,
            },
            street: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            zipcode: {
                type: String,
            },
            country: {
                type: String,
            },
        },
        industries: {
            // Array of strings
            type: [String],
            required: true,
            enum: [
                "Accounting",
                "Marketing",
                "Tech",
                "Consulting",
                "Insurance",
                "Retail",
                "Other",
            ],
        },
        averageRating: {
            type: Number,
            min: [1, "Rating must be at least 1"],
            max: [10, "Rating must can not be more than 10"],
        },
        averageSalary: {
            type: Number,
        },
        photo: {
            type: String,
            default: "no-photo.jpg",
        },
        remoteWork: {
            type: Boolean,
            default: false,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
        // virtuals
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Create company slug from the name
companySchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Geocode & Create location field
companySchema.pre("save", async function (next) {
    const [loc] = await geocoder.geocode(this.address);
    const {
        latitude,
        longitude,
        formattedAddress,
        streetName,
        city,
        stateCode,
        zipcode,
        countryCode,
    } = loc;

    this.location = {
        type: "Point",
        coordinates: [longitude, latitude],
        formattedAddress: formattedAddress,
        street: streetName,
        city: city,
        state: stateCode,
        zipcode: zipcode,
        country: countryCode,
    };

    // Do not save address in DB - we have formattedAdress so there is no need for adress on its own
    this.address = undefined;

    next();
});

// Cascade delete jobs when a company is deleted
companySchema.pre("remove", async function (next) {
    console.log(`Jobs being removed from company ${this._id}`);
    await this.model("Job").deleteMany({ company: this._id });
    next();
});

// Reverse populate with virtuals
companySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "company",
    justOne: false,
});

const Company = mongoose.model("Company", companySchema);

export default Company;
