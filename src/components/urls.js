const IS_DEV = false;

const FRONTEND_URL = IS_DEV
  ? "http://localhost:5713/poll-pulse"
  : "https://polls.labhayatech.com";
const API_URL = FRONTEND_URL + "/api";
export { FRONTEND_URL, API_URL };
