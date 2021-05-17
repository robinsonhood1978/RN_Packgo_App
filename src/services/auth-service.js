import request from 'src/utils/fetch';
import qs from 'qs';
import axios from 'axios';
import {API} from 'src/configs/constant';

const apiPath = `${API}/api`;
const apiToken = `${API}/api-token-auth/`;
const apiProfile = `${apiPath}/packgo/profile/`;
const apiIsActive = `${apiPath}/packgo/isactive/`;
const apiRegister = `${apiPath}/freightcustomers/register/`;
const apiActiveAccount = `${apiPath}/home/active/`;
const apiForgotPwd = `${apiPath}/home/forgot_pwd/`;
const apiVerifyEmail = `${apiPath}/home/verify_email/`;
const apiResetPwd = `${apiPath}/home/resetpwd/`;

export const loginWithEmail = async (data) => {
  const {username, password} = JSON.parse(data);
  console.log(username);
  console.log(password);

  let token;
  let user;
  //  = {
  //   ID: '2075',
  //   user_login: 'robin',
  //   user_pass: '$P$B.DR03SQqyNtIk2H2WerK99ZHKTJlt0',
  //   user_nicename: 'robin',
  //   user_email: 'robinsonhood1978@gmail.com',
  //   user_url: '',
  //   user_registered: '2021-05-06 00:28:05',
  //   user_activation_key: '',
  //   user_status: '0',
  //   display_name: 'Bin Luo',
  //   first_name: 'Bin',
  //   last_name: 'Luo',
  //   avatar: 'https://www.gravatar.com/avatar/8ab5bbc922c5a129d438884cbff8872a',
  //   location: '',
  //   roles: ['wcfm_vendor'],
  // };

  const res = await getToken(username, password);
  if (res.status === 200) {
    token = res.mytoken;
    // await store.dispatch('ship2u/isActive').then((resp) => {
    //   console.log(resp);
    //   active = resp.obj;
    // });
    let active = false;
    active = await isActive(token);
    console.log(active);
    if (active.obj) {
      user = await getProfile(token);
      console.log(user);
    }
  }
  return {token, user};
};

export async function getToken(username, password) {
  let mytoken;
  let status = 200;
  const data = {
    username,
    password,
  };

  await axios
    .post(apiToken, data)
    .then((ret) => {
      mytoken = ret.data.token;
      console.log(mytoken);
    })
    .catch((error) => {
      console.log(error);
      console.log(`${error.response.status}---${error.response.statusText}`);
      status = error.response.status;
    });

  return {status, mytoken};
}

// 查询账户是否已激活
async function isActive(token) {
  let code = 0;
  let msg = '';
  let obj = '';
  try {
    await axios
      .get(apiIsActive, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      })
      .then((resp) => {
        // console.log('get profile ok')
        msg = 'get is_active ok';
        code = 0;
        obj = resp.data;
        // console.log(resp)
      })
      .catch((error) => {
        console.log(error);
        console.log(`${error.response.status}---${error.response.statusText}`);
        code = 2;
      });
  } catch (e) {
    console.log(e);
    code = 3;
  }
  return {code, msg, obj};
}

export async function getProfile(token) {
  let user = '';
  await axios
    .get(apiProfile, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    })
    .then((ret) => {
      user = ret.data;
      user.roles = ['packgo_app_client'];
      // user.ability = [
      //   {
      //     action: 'manage',
      //     subject: 'all',
      //   },
      // ]
      // user.role = 'admin'
      user.display_name = user.customer.first_name + user.customer.last_name;
      user.user_nicename = user.display_name;
      user.user_login = user.display_name;
      user.first_name = user.customer.first_name;
      user.last_name = user.customer.last_name;
      user.ID = user.uid.toString();
      user.user_email = user.customer.email;
      // eslint-disable-next-line global-require
      // user.avatar = require('@/assets/images/avatars/13-small.png')
    });

  return user;
}
//request.post('/mobile-builder/v1/login', data);

export const registerEmail = (data) =>
  request.post('/mobile-builder/v1/register', data);

export const settingProfile = (data, token) =>
  request.post('/mobile-builder/v1/wcfm-profile-settings', data, 'POST', token);

export const forgotPassword = (data) =>
  request.post('/mobile-builder/v1/lost-password', JSON.stringify(data));

export const getCustomer = (customerId) =>
  request.get(`/wc/v3/customers/${customerId}`);
