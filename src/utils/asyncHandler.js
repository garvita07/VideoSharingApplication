// this is the try catch method to create an asyncHandler Wrapper function.

const asyncHandler = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    res.status(error.code).json({
      status: false,
      message: error.message,
    });
  }
};

export default asyncHandler;


