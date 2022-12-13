export class RegexPatterns {
  static readonly youtube = `(?:.+?)?(?:\\/v\\/|watch\\/|\\?v=|\\&v=|youtu.be/|/v=|^youtu.be/|watch%3Fv%3D)([a-zA-Z0-9_-]{11})+`;
  static readonly num = `^[0-9]*$`;
  static readonly phoneNumber = `^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$`;
  static readonly query = `^[a-zA-Z"0-9 ,:!.?\'/]*$`;
  static readonly alpha = `^[a-zA-Z]*$`;
  static readonly socialProfileLink = `^[a-zA-Z0-9_-]*$`;
  static readonly alphaWithSpace = `^[a-zA-Z ]*$`;
  static readonly alphaNumber = `^[a-zA-Z0-9]*$`;
  static readonly alphaNumberWithSpace = `^[a-zA-Z0-9 ]*$`;
  static readonly email = `^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$`;
  // Minimum eight characters, at least one letter, one number and one special character:
  // static readonly passwordStrong = `^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$`;
  // static readonly passwordStrong = `d{8,}`;
  // static readonly passwordStrong = `^[a-zA-Z ]*$`;
  static readonly url = `https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)`;
  static readonly pincode = `d{6}`;
  static readonly bio = `^(.|\s)*[a-zA-Z]+(.|\s)*$`;
  static readonly adminID = `^[A-Z0-9]*$`;
  static readonly gstNumber = `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`;
  static readonly website = `^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$`;
  static readonly matchDuration = `^([0-9]{1})*$`;
}
