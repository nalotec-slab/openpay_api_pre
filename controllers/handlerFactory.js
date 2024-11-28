const catchAsync = require('./../lib/catchAsync');
const AppError = require('./../lib/appError');
const APIFeatures = require('./../lib/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No se encontro registro con ese ID', 406));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No se encontro registro con ese ID', 406));
    }

    res.status(202).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //console.log(req.params.id);
    //filtrar aqui --> popOptions
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No se encontro registro con ese ID', 406));
    }

    const modelName = Model.collection.collectionName;
    res.status(200).json({
      status: 'success',
      data: {
        [modelName]: doc,
      },
    });
  });

exports.getOneMiddleware = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //console.log(req.params.id);
    //filtrar aqui --> popOptions
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No se encontro registro con ese ID', 406));
    }

    req.data = doc;
    next();
  });

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    console.log('req.query');
    console.log(req.query);
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    if (popOptions) features.query = features.query.populate(popOptions);

    const doc = await features.query;
    const modelName = Model.collection.collectionName;
    console.log('Model name:', modelName);
    console.log('Resultado: ', doc.length);
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        [modelName]: doc, //.map((doc) => doc.toObject({ getters: true })),
      },
    });
  });

exports.getAllMiddleware = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    console.log('req.query');
    console.log(req.query);
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    if (popOptions) features.query = features.query.populate(popOptions);
    const doc = await features.query;
    const modelName = Model.collection.collectionName;

    req.data = doc;
    next();
  });
