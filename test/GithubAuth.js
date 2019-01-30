const GithubAuth = require("../server/lib/GithubAuth")
const getAccessToken = GithubAuth.getAccessToken
const getUserInfo = GithubAuth.getUserInfo

var code = "259df0e903a45ed5480d"

getAccessToken(code)
  .then(token => {
    getUserInfo(token)
      .then(userInfo => {
        console.log(userInfo)
      })
      .catch(err => {
        console.log("getUserInfo Error")
        console.log(err)
      })
  })
  .catch(err => {
    console.log("get AccessToken error ")
    console.log(err)
  })
/*
  { login: 'weiyinfu',
    id: 16095925,
    node_id: 'MDQ6VXNlcjE2MDk1OTI1',
    avatar_url: 'https://avatars3.githubusercontent.com/u/16095925?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/weiyinfu',
    html_url: 'https://github.com/weiyinfu',
    followers_url: 'https://api.github.com/users/weiyinfu/followers',
    following_url:
     'https://api.github.com/users/weiyinfu/following{/other_user}',
    gists_url: 'https://api.github.com/users/weiyinfu/gists{/gist_id}',
    starred_url:
     'https://api.github.com/users/weiyinfu/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/weiyinfu/subscriptions',
    organizations_url: 'https://api.github.com/users/weiyinfu/orgs',
    repos_url: 'https://api.github.com/users/weiyinfu/repos',
    events_url: 'https://api.github.com/users/weiyinfu/events{/privacy}',
    received_events_url: 'https://api.github.com/users/weiyinfu/received_events',
    type: 'User',
    site_admin: false,
    name: 'weiyinfu',
    company: 'BUAA',
    blog: 'www.cnblogs.com/weiyinfu',
    location: 'Beijing',
    email: 'wei.yinfu@qq.com',
    hireable: true,
    bio: 'BUAA Student',
    public_repos: 70,
    public_gists: 0,
    followers: 11,
    following: 36,
    created_at: '2015-12-01T07:15:51Z',
    updated_at: '2019-01-10T08:22:34Z' }
  */
