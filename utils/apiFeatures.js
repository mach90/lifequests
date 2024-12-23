/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CLASS APIFEATURES
This class provides filter, sort, paginate, limit field methods for the Handler Factory
//////////////////////////////////////////////////////////////////////////////////////////////////// */
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    /* //////////////////////////////////////////////////
    FILTER
    ////////////////////////////////////////////////// */
    filter() {
        /* FILTERING */
        const queryObj = {...this.queryString};
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach(el => delete queryObj[el]);

        /* ADVANCED FILTERING */
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //regex to replace gte, gt, lte, lt
    
        /* QUERY */
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    } 

    /* //////////////////////////////////////////////////
    SORT
    ////////////////////////////////////////////////// */
    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt"); //without sorting asked, the default sorting will be this
        }

        return this;
    }

    /* //////////////////////////////////////////////////
    LIMIT FIELDS
    ////////////////////////////////////////////////// */
    limitFields() {
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v"); //without field limiting asked, will just exclude this __v
        }

        return this;
    }

    /* //////////////////////////////////////////////////
    PAGINATE
    ////////////////////////////////////////////////// */
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
    
        this.query = this.query.skip(skip).limit(limit);
    
        return this;
    }

}

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
EXPORTS
████████████████████████████████████████████████████████████████████████████████████████████████████ */

module.exports = APIFeatures;