// function UserView(vue) {
//     const uv = PetiteVue.reactive({
//         vue,
//         userInfo: [],

//         loadUserInfo() {

//             native.storageGet('account', (data) => {
//                 if (data) {
//                     this.userInfo = data;
//                 } else {
//                     this.vue.isLoading = true;
//                     api.getUserInfo()
//                         .then((data) => {
//                             this.userInfo = data;
//                             if (data.uid) {
//                                 native.storageSet('account', data);
//                             }
//                             this.vue.isLoading = false;
//                         })
//                         .catch((error) => {
//                             console.error('Error loading user info:', error);
//                             this.vue.isLoading = false;
//                         });
//                 }
//             });
//         },

//         init() {
//             this.loadUserInfo();
//         }
//     });

//     uv.init();

//     return uv;
// }

export default 1