import { httpGet } from "./http";

export function getUSer(userID) {
  return httpGet(`/user/${userID}`);
}

export function editUser(user) {
  return httpGet(`/user/edit/${user}`);
}
