export class RegexPatterns {
  static youtube = `(?:.+?)?(?:\\/v\\/|watch\\/|\\?v=|\\&v=|youtu.be/|/v=|^youtu.be/|watch%3Fv%3D)([a-zA-Z0-9_-]{11})+`;
  static num = `^[0-9]*$`;
  static phoneNumber = `^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$`;
  static query = `^[a-zA-Z"0-9 ,:!.?\'/]*$`;
  static alpha = `^[a-zA-Z]*$`;
  static alphaLink = `^[a-zA-Z0-9_-]*$`;
  static alphaWithSpace = `^[a-zA-Z ]*$`;
  static alphaNumber = `^[a-zA-Z0-9]*$`;
  static alphaNumberWithSpace = `^[a-zA-Z0-9 ]*$`;
  static email = `^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$`;
  // Should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 8 characters long
  static passwordModerate = `(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$`;
  // Should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long
  static passwordStrong = `(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}`;
  static url = `https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)`;
  static pincode = `d{6}`;
  static bio = `^(.|\s)*[a-zA-Z]+(.|\s)*$`;
  static adminID = `^[A-Z0-9]*$`;
  static gstNumber = `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`;
  static website = `^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$`;
  static matchDuration = `^([0-9]{1})*$`;
}
