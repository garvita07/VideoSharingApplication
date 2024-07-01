class apiResponse {
  // there are no classes to extend from here because res, req are not a part of the Nodejs. They are here because of ExpressJs.
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // to get the relatively right anser.
  }
}

export default apiResponse;
