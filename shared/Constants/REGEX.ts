export const YOUTUBE_REGEX =
  '(?:.+?)?(?:\\/v\\/|watch\\/|\\?v=|\\&v=|youtu.be/|/v=|^youtu.be/|watch%3Fv%3D)([a-zA-Z0-9_-]{11})+';
export const ALPHA = /^[a-zA-Z]*$/;
export const ALPHA_LINK = /^[a-zA-Z0-9_-]*$/;
export const ALPHA_W_SPACE = /^[a-zA-Z ]*$/;
export const NUM = /^[0-9]*$/;
export const QUERY = /^[a-zA-Z"0-9 ,:!.?\'/]*$/;
export const ALPHA_NUM = /^[a-zA-Z0-9]*$/;
export const ALPHA_NUM_SPACE = /^[a-zA-Z0-9 ]*$/;
export const EMAIL =
  /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;

// Should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 8 characters long
export const PASS_MODERATE =
  /(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/;

// Should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long
export const PASS_STRONG =
  /(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/;

export const URL =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/;

export const PINCODE_INDIA = /d{6}/;

export const BIO = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
