// this is the try catch method to create an asyncHandler Wrapper function.

const asyncHandler = (func) => async (req, res, next) => {
  try {
    return await func(req, res, next);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      // here, we are using -> error.statusCode because all the throw new apiError will come here only.
      // And, that apiError had a property of statusCode.
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export default asyncHandler;
