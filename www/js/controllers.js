const apiPath = "http://localhost:8090/api/";
const imgPath = "http://localhost:8090/";
angular.module('starter.controllers', [])

    .controller('homeCtrl', function ($scope,$ionicSlideBoxDelegate, $http, homeTableService, $location, $state) {
        $scope.news = [];
        let page = [1, 1];
        $scope.moredata = false;
        /*scope function*/
        $scope.doRefresh = function () {
            homeTableService.getList([1, 1]).then(function (res) {
                if (res.data.ret == 0) {
                    $scope.news = (res.data.data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');//这里是告诉ionic更新数据完成，可以再次触发更新事件
                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        };

        $scope.loadMore = function () {
            page[1]++;
            homeTableService.getList(page).then(function (res) {
                if (res.data.ret == 0) {
                    if (res.data.data.length == 0) {
                        $scope.moredata = true;//这里判断是否还能获取到数据，如果没有获取数据，则不再触发加载事件
                        return false;
                    }
                    $scope.news = (res.data.data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');//这里是告诉ionic更新数据完成，可以再次触发更新事件
                    $scope.$broadcast('scroll.refreshComplete');
                }
            })
        }

        $scope.intoDetail = function (url, date) {
            let path = url.split("?")[1];
            //$location.path("/tab/home/"+path,{cache:false});
            $state.go("tab.home-detail", {id: path, date: date})
        }

    })

    .controller('homeDetailCtrl', function ($scope, $stateParams, homeTableService) {
        homeTableService.getDetail($stateParams.id).then(function (res) {
            if (res.data.ret == 0) {
                $scope.detail = res.data.data;
                $scope.detail.date = $stateParams.date
            }
        })
    })

    .controller('BBSCtrl', function ($scope,$state,$http,BBSService) {
        let page = 1;
        $scope.topicData = [];
        $scope.moredata = false;
        BBSService.queryAllTopic({page:page}).then(function (res) {
            if(res.data.ret == 0){
                $scope.topicData = res.data.data;
            }
        });

        $scope.doRefresh = function () {
            BBSService.queryAllTopic({page:1}).then(function (res) {
                if (res.data.ret == 0) {
                    $scope.topicData = res.data.data;
                    $scope.$broadcast('scroll.infiniteScrollComplete');//这里是告诉ionic更新数据完成，可以再次触发更新事件
                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        };

       $scope.loadMore = function () {
            BBSService.queryAllTopic({page:page}).then(function (res) {
                if (res.data.ret == 0) {
                    if (res.data.data.length == 0) {
                        console.log(res.data.data.length);
                        $scope.moredata = true;//这里判断是否还能获取到数据，如果没有获取数据，则不再触发加载事件
                        return false;
                    }
                    $scope.topicData = res.data.data;
                    $scope.$broadcast('scroll.infiniteScrollComplete');//这里是告诉ionic更新数据完成，可以再次触发更新事件
                    $scope.$broadcast('scroll.refreshComplete');
                }
            })
           ++page;
        };

      $scope.intoDetail = function (obj) {
        $state.go("tab.topic-detail", {o:obj._id})
      }

    })
    .controller('topicDetailCtrl', function ($scope,$stateParams,$http,BBSService) {
        $scope.cc = {};
        BBSService.querySingleTopic($stateParams.o).then(function (res) {
            if(res.data.ret == 0){
                $scope.topicDetail = res.data.data;
            }
        })

        BBSService.queryCommentDetail($stateParams.o).then(function (res) {
            if(res.data.ret == 0){
                $scope.comments = res.data.data;
                $scope.commentsLen = res.data.data.length;
            }
        })

        $scope.submit = function () {
            let data = {
                token: localStorage.getItem("access_token"),
                topic_id: $stateParams.o,
                content: $scope.cc.c
            }
            BBSService.replyTopic(data).then(function (res) {
                $scope.cc.c = "";
                BBSService.queryCommentDetail($stateParams.o).then(function (res) {
                  if(res.data.ret == 0){
                    $scope.comments = res.data.data;
                    $scope.commentsLen = res.data.data.length;
                  }
                })
            })
        }
    })
    .controller('createTopicCtrl', function ($scope,$state,$http,BBSService,accountService) {
        let t = localStorage.getItem("access_token") ;
        $scope.topicInfo = {
            token: t
        };
        $scope.tabs = [
            {text:"农作物",value:"crop"},
            {text:"气候",value:"climate"},
            {text:"土壤",value:"soil"}
        ];
        if(t){
            accountService.loginIn(0,t).then(function (res) {
                if(res.data.ret != 0){
                    alert("请先登陆");
                    $state.go("tab.account");
                }
            });
        }else{
            alert("请先登陆")
            $state.go("tab.account");
        }

        $scope.submitTopic = function () {
            BBSService.createTopic($scope.topicInfo).then(function (res) {
                if(res.data.ret == 0){
                    alert("创建成功!");
                    $state.go("tab.bbs");
                }
            })
        };
    })


    .controller('SearchCtrl', function ($scope,SearchService) {
        $scope.searchData = {}

        $scope.search = function(){
            SearchService.search({
                keyword: escape($scope.searchData.ctx),
                offset:10
            }).then(function(res){
                console.log(res);
                $scope.searchData.list=res.data.data.html
            })
        }

    })

    .controller('AccountCtrl', function ($scope, $http, $state, accountService) {
        $scope.userInfo = {};
        $scope.loginIn = function (type, str) {
            let o = type == 0 ? str : $scope.userInfo;
            accountService.loginIn(type, o).then(function (res) {
                if (res.data.ret == 0) {
                    //跳转去显示登陆态页面
                    localStorage.setItem("userMsg", JSON.stringify(res.data.userInfo));
                    localStorage.setItem("access_token", res.data.data.token);
                    $state.go("tab.userDetail", {name: res.data.name,type:type})
                }
            })
        };
        let t = localStorage.getItem("access_token");
        if (t) {
            $scope.loginIn(0, t);
        }

    })
    .controller('userSetCtrl', function ($scope, $stateParams, accountService) {
        this.isClean = false;
        $scope.retUrl = "#/tab/userDetail";
        $scope.clean = function () {
            localStorage.clear();
            $scope.retUrl = "#/tab/account";
            setTimeout(function(){
                alert("清理完成");
            },400)
        }
    })

    .controller('UserDetailCtrl', function ($scope, $http, $state, accountService, $stateParams) {
      let t = localStorage.getItem("access_token");

      if($stateParams.type==0){
            $scope.userInfo = JSON.parse(localStorage.getItem("userMsg"));
            $scope.userInfo.faceUrl = imgPath + $scope.userInfo.faceUrl.replace("upload/", "");
        }

        accountService.loginIn(0, t).then(function (res) {
            if (res.data.ret == 0) {
              $scope.userInfo = res.data.userInfo;
              $scope.userInfo.faceUrl = imgPath + res.data.userInfo.faceUrl.replace("upload/", "");
            }
        });

        $scope.loginOut = function () {
            localStorage.removeItem("userMsg");
            localStorage.removeItem("access_token");
            accountService.loginOut().then(function (res) {
                if (res.data.ret == 0) {
                    $state.go("tab.account")
                }
            })
        }
    })
    .controller('CreateUserCtrl', function ($scope, accountService, $ionicActionSheet, $cordovaCamera, $cordovaFileTransfer) {

        $scope.userInfo = {};

        $scope.facePic = "";
        $scope.addPhoto = function () {
            $ionicActionSheet.show({
                cancelOnStateChange: true,
                cssClass: 'action_s',
                titleText: "请选择获取图片方式",
                buttons: [
                    {text: '相机'},
                    {text: '图库'}
                ],
                cancelText: '取消',
                cancel: function () {
                    return true;
                },
                buttonClicked: function (index) {

                    switch (index) {
                        case 0:
                            $scope.takePhoto();
                            break;
                        case 1:
                            $scope.pickImage();
                            break;
                        default:
                            break;
                    }
                    return true;
                }
            });
        };

        //拍照
        $scope.takePhoto = function () {
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,//Choose the format of the return value.
                sourceType: Camera.PictureSourceType.CAMERA,//资源类型：CAMERA打开系统照相机；PHOTOLIBRARY打开系统图库
                targetWidth: 150,//头像宽度
                targetHeight: 150//头像高度

            };

            $cordovaCamera.getPicture(options)
                .then(function (imageURI) {
                    //Success
                    $scope.imageSrc = imageURI;
                    $scope.uploadPhoto();
                }, function (err) {
                    // Error
                });
        };

        //选择照片
        $scope.pickImage = function () {
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,//Choose the format of the return value.
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,//资源类型：CAMERA打开系统照相机；PHOTOLIBRARY打开系统图库
                targetWidth: 150,//头像宽度
                targetHeight: 150//头像高度
            };

            $cordovaCamera.getPicture(options)
                .then(function (imageURI) {
                    //Success
                    $scope.imageSrc = imageURI;
                    //$scope.uploadPhoto();
                }, function (err) {
                    // Error
                });
        };

        $scope.uploadPhoto = function () {
            var requestParams = "?name=" + $scope.userInfo.name;

            var server = encodeURI(apiPath + "uploadFace" + requestParams);
            var fileURL = $scope.imageSrc;
            var options = {
                fileKey: "file",//相当于form表单项的name属性
                fileName: fileURL.substr(fileURL.lastIndexOf('/') + 1),
                mimeType: "image/jpeg"
                //data:$scope.userInfo
            };

            $cordovaFileTransfer.upload(server, fileURL, options)
                .then(function (result) {
                    // Success!
                    alert("Code = " + result.responseCode + "Response = " + result.response + "Sent = " + result.bytesSent);
                }, function (err) {
                    // Error
                    alert("An error has occurred: Code = " + error.code + "upload error source " + error.source + "upload error target " + error.target);
                }, function (progress) {
                    // constant progress updates
                });

        };

        $scope.createUser = function () {
            accountService.signUp($scope.userInfo).then(function (resp) {
                alert("注册成功!")
                localStorage.setItem("access_token", resp.data.data.token);
                localStorage.setItem("userMsg", JSON.stringify(resp.data.userInfo));
                $scope.uploadPhoto();
                //跳转到展示页面
                accountService.loginIn(0, o).then(function (res) {
                    if (res.data.ret == 0) {
                        //跳转去显示登陆态页面
                        $state.go("tab.userDetail", {name: resp.data.userInfo.name})
                    }
                })
            })
        };
    })
;


function getParams(url) {
    let item = url.split("?");
    let res = {};
    let obj = item[1].split("&");
    for (let o of obj) {
        let tmp = o.split("=");
        res[tmp[0]] = tmp[1];
    }
    return res;
}
