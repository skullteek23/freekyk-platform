export const YOUTUBE_REGEX =
  '(?:.+?)?(?:\\/v\\/|watch\\/|\\?v=|\\&v=|youtu.be/|/v=|^youtu.be/|watch%3Fv%3D)([a-zA-Z0-9_-]{11})+';
export const ALPHA: RegExp = /^[a-zA-Z]*$/;
export const ALPHA_W_SPACE: RegExp = /^[a-zA-Z ]*$/;
export const NUM: RegExp = /^[0-9]*$/;
export const QUERY: RegExp = /^[a-zA-Z"0-9 ,:!.?\'/]*$/;
export const ALPHA_NUM: RegExp = /^[a-zA-Z0-9]*$/;
export const ALPHA_NUM_SPACE: RegExp = /^[a-zA-Z0-9 ]*$/;
export const EMAIL: RegExp =
  /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;

// Should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 8 characters long
export const PASS_MODERATE: RegExp =
  /(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/;

// Should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long
export const PASS_STRONG: RegExp =
  /(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/;

export const URL: RegExp =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/;

export const PINCODE_INDIA = 'd{6}';

export const BIO = '^[a-zA-Z0-9.! ]*$';
