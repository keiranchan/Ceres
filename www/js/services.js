angular.module('starter.services', [])
    .service('homeTableService',function($http){
        this.getClassify = function(){
          return [
            {name: "科普", viewable: true, url:""},
            {name: "新闻", viewable: true, url:""}
          ]
        };
        this.getList = function(page){
            return $http.post(apiPath+"newSummary",{page:page})
        };
        this.getDetail = function (params) {
            let url  = "http://www.zdkjxn.com/Item/Show.asp?"+params;
            return $http.post(apiPath+"newDetail",{url:url})
        }

    })
    .service('SearchService',function ($http) {
        this.search = function(obj){
           return $http.post(apiPath+"search",obj)
        }

    })
    .service('BBSService',function ($http) {
        this.createTopic = function (obj) {
            return $http.post(apiPath+"createTopic",obj)
        }

        this.queryAllTopic = function (obj) {
            return $http.post(apiPath+"queryAllTopic",obj)
        }
        this.querySingleTopic = function(id){
            return $http.get(apiPath+"getTopicById?id="+id)
        }
        this.queryCommentDetail = function (id) {
            return $http.get(apiPath+"getTopicDetail?id="+id)
        }
        this.replyTopic = function (obj) {
            return $http.post(apiPath+"replyTopic",obj)
        }
    })
    .service('accountService',function ($http) {
        this.loginIn = function (type,obj) {
            if(type==0){
                return $http.get(apiPath+"loginIn?token="+obj)
            }else if (type==1){
                return $http.post(apiPath+"loginIn",obj)
            }
        };

        this.signUp = function (obj) {
            return $http.post(apiPath+"createUser",obj)
        }

        this.loginOut = function () {
            //loginOut
            return $http.get(apiPath+"loginOut")
        }
    })
;
