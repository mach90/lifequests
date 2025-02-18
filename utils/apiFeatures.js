/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CLASS APIFEATURES
This class provides filter, sort, paginate, limit field methods for the Handler Factory
//////////////////////////////////////////////////////////////////////////////////////////////////// */
class APIFeatures {
    constructor(query, queryString) {
        // Initialize the query object
        this.query = query;
        // Initialize the query string object
        this.queryString = queryString;
    }

    /* //////////////////////////////////////////////////
    FILTER
    ////////////////////////////////////////////////// */
    filter() {
        /* FILTERING */
        // Create a copy of the query string object
        const queryObj = {...this.queryString};

        // Define fields to be excluded from the query
        const excludedFields = ["page", "sort", "limit", "fields"];

        // Remove excluded fields from the query object
        excludedFields.forEach(el => delete queryObj[el]);

        /* ADVANCED FILTERING */
        // Convert the query object to a JSON string
        let queryStr = JSON.stringify(queryObj);

        // Replace comparison operators with MongoDB query operators
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //regex to replace gte, gt, lte, lt

        /* QUERY */
        // Apply the filtered query to the database query
        this.query = this.query.find(JSON.parse(queryStr));

        // Return the current instance to allow method chaining
        return this;
    }

    /* //////////////////////////////////////////////////
    SORT
    ////////////////////////////////////////////////// */
    sort() {
        // Check if the query string contains a sort parameter
        if(this.queryString.sort) {
            // Split the sort parameter by commas and join with spaces to create the sortBy string
            const sortBy = this.queryString.sort.split(",").join(" ");
            // Apply the sort to the query
            this.query = this.query.sort(sortBy);
        } else {
            // If no sort parameter is provided, default to sorting by createdAt in descending order
            this.query = this.query.sort("-createdAt");
        }

        // Return the current instance to allow method chaining
        return this;
    }

    /* //////////////////////////////////////////////////
    LIMIT FIELDS
    ////////////////////////////////////////////////// */
    limitFields() {
        // Check if the query string contains a fields parameter
        if(this.queryString.fields) {
            // Split the fields parameter by commas and join with spaces to create the fields string
            const fields = this.queryString.fields.split(",").join(" ");
            // Apply the field selection to the query
            this.query = this.query.select(fields);
        } else {
            // If no fields parameter is provided, exclude the __v field from the query
            this.query = this.query.select("-__v");
        }

        // Return the current instance to allow method chaining
        return this;
    }

    /* //////////////////////////////////////////////////
    PAGINATE
    ////////////////////////////////////////////////// */
    paginate() {
        // Get the page number from the query string, default to 1 if not provided
        const page = this.queryString.page * 1 || 1;

        // Get the limit of items per page from the query string, default to 100 if not provided
        const limit = this.queryString.limit * 1 || 100;

        // Calculate the number of items to skip based on the page number and limit
        const skip = (page - 1) * limit;

        // Apply the skip and limit to the query
        this.query = this.query.skip(skip).limit(limit);

        // Return the current instance to allow method chaining
        return this;
    }
}

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
EXPORTS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
module.exports = APIFeatures;