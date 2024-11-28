class APIFeatures {
  constructor(query, queryString) {
    //console.log('  constructor(query, queryString) {');
    this.query = query;
    this.queryString = queryString;
    //console.log(`this.query:`);
    //console.log(this.query);
    //console.log(`this.queryString:`);
    //console.log(this.queryString);
  }

  filter() {
    //console.log(this.queryString);
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //Agregar eq

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //console.log('this', this.queryString.sort);
      const sortBy = this.queryString.sort.split(',').join(' ');
      //console.log('sortby', sortBy);
      this.query = this.query.sort(sortBy);
      //console.log('this.query', this.query);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      //console.log(this.query_userProvidedFields);
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      //console.log(this.query_userProvidedFields);
    } else {
      this.query = this.query.select('-password -__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100; // *** NOTE regresar esto a 100
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
