# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.36.0"></a>
# [1.36.0](https://github.com/digithun/jamplay-nap/compare/v1.35.0...v1.36.0) (2018-05-02)


### Bug Fixes

* **cloudbuild:** fix dpeloyment container set name to IMAGE_NAME ([8208d3b](https://github.com/digithun/jamplay-nap/commit/8208d3b))
* **package:** add s3-upload-stream ([af6a98f](https://github.com/digithun/jamplay-nap/commit/af6a98f))
* **static-url:** removes static url if private bucket ([9d40ac7](https://github.com/digithun/jamplay-nap/commit/9d40ac7))


### Features

* **graphql:** add cost analysis ([ca69438](https://github.com/digithun/jamplay-nap/commit/ca69438))
* **secureupload:** implement private bucket upload for writer-document ([08c140d](https://github.com/digithun/jamplay-nap/commit/08c140d))



<a name="1.33.1"></a>
## [1.33.1](https://github.com/digithun/jamplay-nap/compare/v1.33.0...v1.33.1) (2018-03-29)



<a name="1.35.0"></a>
# [1.35.0](https://github.com/digithun/jamplay-nap/compare/v1.34.2...v1.35.0) (2018-04-23)


### Bug Fixes

* **GA_cookie:** fix cookie function for GA ([8d651dd](https://github.com/digithun/jamplay-nap/commit/8d651dd)), closes [#JAMP-1266](https://github.com/digithun/jamplay-nap/issues/JAMP-1266)
* **graphql:** remove unused fields ([24dc816](https://github.com/digithun/jamplay-nap/commit/24dc816))


### Features

* **GA_MAIL:** Allow set _ga cookie from query ([8258db3](https://github.com/digithun/jamplay-nap/commit/8258db3)), closes [#JAMP-1266](https://github.com/digithun/jamplay-nap/issues/JAMP-1266)
* **GA_MAIL:** fix param url ([2a4627e](https://github.com/digithun/jamplay-nap/commit/2a4627e))



<a name="1.34.2"></a>
## [1.34.2](https://github.com/digithun/jamplay-nap/compare/v1.34.1...v1.34.2) (2018-04-20)



<a name="1.34.1"></a>
## [1.34.1](https://github.com/digithun/jamplay-nap/compare/v1.34.0...v1.34.1) (2018-04-11)



<a name="1.34.0"></a>
# [1.34.0](https://github.com/digithun/jamplay-nap/compare/v1.33.0...v1.34.0) (2018-04-10)


### Bug Fixes

* **book-schema:** fix error ([f8c20c7](https://github.com/digithun/jamplay-nap/commit/f8c20c7))
* **ewallet:** add requestHeaders to ewallet ([3d7b242](https://github.com/digithun/jamplay-nap/commit/3d7b242))
* **GAEMAIL:** temporary removed ([a5c7d5f](https://github.com/digithun/jamplay-nap/commit/a5c7d5f))
* **package:** fix jamplay-apollo-upload-server ([08c077b](https://github.com/digithun/jamplay-nap/commit/08c077b))
* **pen test:** fix pen test multipart crash ([b1d0a5e](https://github.com/digithun/jamplay-nap/commit/b1d0a5e)), closes [#1259](https://github.com/digithun/jamplay-nap/issues/1259)
* **subscription:** fix spam noti when sub/unsub over and over ([02a788a](https://github.com/digithun/jamplay-nap/commit/02a788a))


### Features

* **EMAILVERIFY:** add email GA cookie ([9c4db55](https://github.com/digithun/jamplay-nap/commit/9c4db55))
* **follow:**  commit graphql/content ([572dbff](https://github.com/digithun/jamplay-nap/commit/572dbff))
* **notfication:** fix noti follower graphql content ([e9d15e0](https://github.com/digithun/jamplay-nap/commit/e9d15e0))
* **notification:** add follower notification event ([5b4e53b](https://github.com/digithun/jamplay-nap/commit/5b4e53b))



<a name="1.33.0"></a>
# [1.33.0](https://github.com/digithun/jamplay-nap/compare/1.32.0...1.33.0) (2018-03-29)


### Bug Fixes

* **build:** deployment name cicd ([8be0376](https://github.com/digithun/jamplay-nap/commit/8be0376))
* **ewallet:** able to set timeout per api ([e112ffd](https://github.com/digithun/jamplay-nap/commit/e112ffd))
* **express:** Less info via ping #JAMP-1247 ([6493855](https://github.com/digithun/jamplay-nap/commit/6493855))


### Features

* add get list follow and sub/unsubscribe ([212ef1a](https://github.com/digithun/jamplay-nap/commit/212ef1a))
* add get list follow and sub/unsubscribe ([609d9eb](https://github.com/digithun/jamplay-nap/commit/609d9eb))
* **follow:**  commit submodule graphql ([2aa90d3](https://github.com/digithun/jamplay-nap/commit/2aa90d3))
* **follower:** add follower query for author ([9c2deac](https://github.com/digithun/jamplay-nap/commit/9c2deac))
* **mongoose0elastic:** add mongoose elastic ([80928e1](https://github.com/digithun/jamplay-nap/commit/80928e1))



<a name="1.31.0"></a>
# [1.31.0](https://github.com/digithun/jamplay-nap/compare/v1.29.5...v1.31.0) (2018-03-12)


### Bug Fixes

* **affiliate:** change event hook ([b9f3861](https://github.com/digithun/jamplay-nap/commit/b9f3861))
* **affiliate:** move hook to user event hook ([f730d04](https://github.com/digithun/jamplay-nap/commit/f730d04))
* **affiliate:** wrong hook event ([55fe6ed](https://github.com/digithun/jamplay-nap/commit/55fe6ed))
* **authen:** Use emailVerifiedAt for all case ([a0ca6ca](https://github.com/digithun/jamplay-nap/commit/a0ca6ca))
* **cors:** not force to define cors white-list ([257049d](https://github.com/digithun/jamplay-nap/commit/257049d))
* **creditcard:** check null to array ([8607ffe](https://github.com/digithun/jamplay-nap/commit/8607ffe))
* **emitter:** Use global NAP instead of req.nap ([328a3a7](https://github.com/digithun/jamplay-nap/commit/328a3a7))
* **Episode:** can read with no login if free ([91c490a](https://github.com/digithun/jamplay-nap/commit/91c490a))
* **event-handlers:** allow null on validate ewallet event ([062f6dd](https://github.com/digithun/jamplay-nap/commit/062f6dd))
* **initMongoose:** inject connection instead of use mongoose ([50fb2b6](https://github.com/digithun/jamplay-nap/commit/50fb2b6))
* **initMongoose:** setTimeout to exit if database not ready ([1ed9568](https://github.com/digithun/jamplay-nap/commit/1ed9568))


### Features

* **auth:** Will emit user status after register ([edc5f26](https://github.com/digithun/jamplay-nap/commit/edc5f26))
* **referal:** Will emit when user signup ([b48323d](https://github.com/digithun/jamplay-nap/commit/b48323d))



<a name="1.30.0"></a>
# [1.30.0](https://github.com/digithun/jamplay-nap/compare/v1.29.5...v1.30.0) (2018-02-27)


### Bug Fixes

* **authen:** Use emailVerifiedAt for all case ([a0ca6ca](https://github.com/digithun/jamplay-nap/commit/a0ca6ca))
* **creditcard:** check null to array ([8607ffe](https://github.com/digithun/jamplay-nap/commit/8607ffe))
* **emitter:** Use global NAP instead of req.nap ([328a3a7](https://github.com/digithun/jamplay-nap/commit/328a3a7))
* **event-handlers:** allow null on validate ewallet event ([062f6dd](https://github.com/digithun/jamplay-nap/commit/062f6dd))
* **initMongoose:** inject connection instead of use mongoose ([50fb2b6](https://github.com/digithun/jamplay-nap/commit/50fb2b6))
* **initMongoose:** setTimeout to exit if database not ready ([1ed9568](https://github.com/digithun/jamplay-nap/commit/1ed9568))


### Features

* **auth:** Will emit user status after register ([edc5f26](https://github.com/digithun/jamplay-nap/commit/edc5f26))
* **referal:** Will emit when user signup ([b48323d](https://github.com/digithun/jamplay-nap/commit/b48323d))



<a name="1.29.9"></a>
## [1.29.9](https://github.com/digithun/jamplay-nap/compare/v1.29.5...v1.29.9) (2018-02-19)


### Bug Fixes

* **creditcard:** check null to array ([8607ffe](https://github.com/digithun/jamplay-nap/commit/8607ffe))
* **event-handlers:** allow null on validate ewallet event ([062f6dd](https://github.com/digithun/jamplay-nap/commit/062f6dd))



<a name="1.29.8"></a>
## [1.29.8](https://github.com/digithun/jamplay-nap/compare/v1.29.5...v1.29.8) (2018-02-15)


### Bug Fixes

* **creditcard:** check null to array ([8607ffe](https://github.com/digithun/jamplay-nap/commit/8607ffe))
* **event-handlers:** allow null on validate ewallet event ([062f6dd](https://github.com/digithun/jamplay-nap/commit/062f6dd))



<a name="1.29.7"></a>
## [1.29.7](https://github.com/digithun/jamplay-nap/compare/v1.29.5...v1.29.7) (2018-02-14)


### Bug Fixes

* **creditcard:** check null to array ([8607ffe](https://github.com/digithun/jamplay-nap/commit/8607ffe))
* **event-handlers:** allow null on validate ewallet event ([062f6dd](https://github.com/digithun/jamplay-nap/commit/062f6dd))



<a name="1.29.6"></a>
## [1.29.6](https://github.com/digithun/jamplay-nap/compare/v1.29.5...v1.29.6) (2018-02-14)


### Bug Fixes

* **event-handlers:** allow null on validate ewallet event ([062f6dd](https://github.com/digithun/jamplay-nap/commit/062f6dd))



<a name="1.29.5"></a>
## [1.29.5](https://github.com/digithun/jamplay-nap/compare/v1.29.4...v1.29.5) (2018-02-13)



<a name="1.29.4"></a>
## [1.29.4](https://github.com/digithun/jamplay-nap/compare/v1.29.2...v1.29.4) (2018-02-12)


### Bug Fixes

* **event-handlers:** allow '' for promotionType, promotion from ewallet ([e9f8b19](https://github.com/digithun/jamplay-nap/commit/e9f8b19))
* **package:** build docker by jamplay-utils suspend ([d12644d](https://github.com/digithun/jamplay-nap/commit/d12644d))



<a name="1.29.3"></a>
## [1.29.3](https://github.com/digithun/jamplay-nap/compare/v1.29.2...v1.29.3) (2018-02-09)


### Bug Fixes

* **event-handlers:** allow '' for promotionType, promotion from ewallet ([e9f8b19](https://github.com/digithun/jamplay-nap/commit/e9f8b19))
* **package:** build docker by jamplay-utils suspend ([d12644d](https://github.com/digithun/jamplay-nap/commit/d12644d))



<a name="1.29.2"></a>
## [1.29.2](https://github.com/digithun/jamplay-nap/compare/v1.29.1...v1.29.2) (2018-02-05)


### Bug Fixes

* **notification:** terminate polling ([823efa4](https://github.com/digithun/jamplay-nap/commit/823efa4))
* **package:** change package name ([af22916](https://github.com/digithun/jamplay-nap/commit/af22916))
* **package:** update build scripts ([25f86e8](https://github.com/digithun/jamplay-nap/commit/25f86e8))



<a name="1.29.1"></a>
## [1.29.1](https://github.com/digithun/jamplay-nap/compare/v1.29.0...v1.29.1) (2018-01-30)



<a name="1.29.0"></a>
# [1.29.0](https://github.com/digithun/jamplay-nap/compare/v1.28.4...v1.29.0) (2018-01-29)


### Bug Fixes

* **auth:** Fixed 11000 null by use fb.id+custom_email as key ([b6aafb4](https://github.com/digithun/jamplay-nap/commit/b6aafb4))
* **auth:** Fixed wrong user state after double verified ([fca616c](https://github.com/digithun/jamplay-nap/commit/fca616c))
* **auth:** Update user facebok profile when re-login ([dae9c1f](https://github.com/digithun/jamplay-nap/commit/dae9c1f))
* **auth:** Use AUTH_EMAIL_NOT_VERIFIED ([7526d99](https://github.com/digithun/jamplay-nap/commit/7526d99))
* **auth:** Won't upsert, and will return updated user ([fc778b6](https://github.com/digithun/jamplay-nap/commit/fc778b6))
* **event-handlers:** re schema ([7924e00](https://github.com/digithun/jamplay-nap/commit/7924e00))
* **ewallet:** add promotionType ([9665b64](https://github.com/digithun/jamplay-nap/commit/9665b64))
* **payment:** add promotionType ([82303fb](https://github.com/digithun/jamplay-nap/commit/82303fb))
* **user-handlers, user-event-hook:** send to event instead of archivement ([4b87ae3](https://github.com/digithun/jamplay-nap/commit/4b87ae3))


### Features

* **event:** add event service ([8525044](https://github.com/digithun/jamplay-nap/commit/8525044))
* **notification:** add long polling endpoint for notification update status ([d99982c](https://github.com/digithun/jamplay-nap/commit/d99982c))



<a name="1.28.4"></a>
## [1.28.4](https://github.com/digithun/jamplay-nap/compare/v1.28.3...v1.28.4) (2018-01-19)


### Bug Fixes

* **passport-authen:** check email on login with fb with email ([822b600](https://github.com/digithun/jamplay-nap/commit/822b600))



<a name="1.28.3"></a>
## [1.28.3](https://github.com/digithun/jamplay-nap/compare/v1.28.2...v1.28.3) (2018-01-19)


### Bug Fixes

* **notification:** mark as read after 3s ([01f185b](https://github.com/digithun/jamplay-nap/commit/01f185b))



<a name="1.28.2"></a>
## [1.28.2](https://github.com/digithun/jamplay-nap/compare/v1.28.1...v1.28.2) (2018-01-18)


### Bug Fixes

* **ewallet:** throw error if callApi got error ([797b577](https://github.com/digithun/jamplay-nap/commit/797b577))



<a name="1.28.1"></a>
## [1.28.1](https://github.com/digithun/jamplay-nap/compare/v1.27.0...v1.28.1) (2018-01-18)


### Bug Fixes

* **notification:** fix notification not show multiple window ([b2b0294](https://github.com/digithun/jamplay-nap/commit/b2b0294))



<a name="1.28.0"></a>
# [1.28.0](https://github.com/digithun/jamplay-nap/compare/v1.25.7...v1.28.0) (2018-01-17)


### Bug Fixes

* **auth:** Fixed user already verified fb/email can't login ([bc2af9a](https://github.com/digithun/jamplay-nap/commit/bc2af9a))
* **auth:** Fixed wrong error code ([4aeb24d](https://github.com/digithun/jamplay-nap/commit/4aeb24d))
* **auth:** Use AUTH_MISSING_EMAIL ([83aa095](https://github.com/digithun/jamplay-nap/commit/83aa095))
* **ewallet:** check token first before call ([c2a1c4e](https://github.com/digithun/jamplay-nap/commit/c2a1c4e))
* **scripts:** merge scripts ([81775b9](https://github.com/digithun/jamplay-nap/commit/81775b9))
* **User:** add writer, super reader role ([8082bc9](https://github.com/digithun/jamplay-nap/commit/8082bc9))


### Features

* **auth:** Add AUTH_FB_EMAIL_NOT_VERIFIED ([025b513](https://github.com/digithun/jamplay-nap/commit/025b513))
* **auth:** Add signup with facebook and email ([c15bee4](https://github.com/digithun/jamplay-nap/commit/c15bee4))
* **auth:** Will throw AUTH_EMAIL_NOT_VERIFIED ([148ff6d](https://github.com/digithun/jamplay-nap/commit/148ff6d))
* **auth:** Will throw AUTH_FB_EMAIL_NOT_VERIFIED ([f885136](https://github.com/digithun/jamplay-nap/commit/f885136))
* **auth:** Will throw AUTH_INVALID_EMAIL for empty email ([b1b28cd](https://github.com/digithun/jamplay-nap/commit/b1b28cd))



<a name="1.27.0"></a>
# [1.27.0](https://github.com/digithun/jamplay-nap/compare/v1.26.0...v1.27.0) (2018-01-16)


### Bug Fixes

* **auth:** Fixed user already verified fb/email can't login ([bc2af9a](https://github.com/digithun/jamplay-nap/commit/bc2af9a))
* **auth:** Fixed wrong error code ([4aeb24d](https://github.com/digithun/jamplay-nap/commit/4aeb24d))
* **auth:** Use AUTH_MISSING_EMAIL ([83aa095](https://github.com/digithun/jamplay-nap/commit/83aa095))
* **scripts:** merge scripts ([81775b9](https://github.com/digithun/jamplay-nap/commit/81775b9))


### Features

* **auth:** Add AUTH_FB_EMAIL_NOT_VERIFIED ([025b513](https://github.com/digithun/jamplay-nap/commit/025b513))
* **auth:** Will throw AUTH_EMAIL_NOT_VERIFIED ([148ff6d](https://github.com/digithun/jamplay-nap/commit/148ff6d))
* **auth:** Will throw AUTH_FB_EMAIL_NOT_VERIFIED ([f885136](https://github.com/digithun/jamplay-nap/commit/f885136))
* **auth:** Will throw AUTH_INVALID_EMAIL for empty email ([b1b28cd](https://github.com/digithun/jamplay-nap/commit/b1b28cd))



<a name="1.26.0"></a>
# [1.26.0](https://github.com/digithun/jamplay-nap/compare/v1.25.7...v1.26.0) (2018-01-11)


### Bug Fixes

* **ewallet:** check token first before call ([c2a1c4e](https://github.com/digithun/jamplay-nap/commit/c2a1c4e))
* **User:** add writer, super reader role ([8082bc9](https://github.com/digithun/jamplay-nap/commit/8082bc9))


### Features

* **auth:** Add signup with facebook and email ([c15bee4](https://github.com/digithun/jamplay-nap/commit/c15bee4))



<a name="1.25.7"></a>
## [1.25.7](https://github.com/digithun/jamplay-nap/compare/v1.25.6...v1.25.7) (2018-01-02)



<a name="1.25.6"></a>
## [1.25.6](https://github.com/digithun/jamplay-nap/compare/v1.25.4...v1.25.6) (2017-12-30)


### Bug Fixes

* **email:** change amount to due ([18defff](https://github.com/digithun/jamplay-nap/commit/18defff))
* **user-event-hook:** fix auto gen sessionToken ([3626bd8](https://github.com/digithun/jamplay-nap/commit/3626bd8))



<a name="1.25.5"></a>
## [1.25.5](https://github.com/digithun/jamplay-nap/compare/v1.25.4...v1.25.5) (2017-12-29)


### Bug Fixes

* **email:** change amount to due ([18defff](https://github.com/digithun/jamplay-nap/commit/18defff))
* **user-event-hook:** fix auto gen sessionToken ([3626bd8](https://github.com/digithun/jamplay-nap/commit/3626bd8))



<a name="1.25.4"></a>
## [1.25.4](https://github.com/digithun/jamplay-nap/compare/v1.25.3...v1.25.4) (2017-12-29)


### Bug Fixes

* **user-event-hook:** auto gen sessionToken if no token but got user ([f734fb0](https://github.com/digithun/jamplay-nap/commit/f734fb0))



<a name="1.25.3"></a>
## [1.25.3](https://github.com/digithun/jamplay-nap/compare/v1.25.2...v1.25.3) (2017-12-28)


### Bug Fixes

* **authen:** expose loginWithFacebook for content can extend authen with facebook ([f496caf](https://github.com/digithun/jamplay-nap/commit/f496caf))
* **email-template:** fix template layout ([11ad344](https://github.com/digithun/jamplay-nap/commit/11ad344))
* **User:** add profilePicture ([fee28b2](https://github.com/digithun/jamplay-nap/commit/fee28b2))



<a name="1.25.2"></a>
## [1.25.2](https://github.com/digithun/jamplay-nap/compare/v1.25.1...v1.25.2) (2017-12-26)


### Bug Fixes

* **share:** fix share image url to match web's path ([d20fcf3](https://github.com/digithun/jamplay-nap/commit/d20fcf3))
* **User:** not more extend schema ([3972bf9](https://github.com/digithun/jamplay-nap/commit/3972bf9))
* **user-event-hook:** forgot remove debug ([95daa8a](https://github.com/digithun/jamplay-nap/commit/95daa8a))



<a name="1.25.1"></a>
## [1.25.1](https://github.com/digithun/jamplay-nap/compare/v1.25.0...v1.25.1) (2017-12-22)


### Bug Fixes

* **template:** edit footer ([3972247](https://github.com/digithun/jamplay-nap/commit/3972247))
* **user-event-hook:** update error handler ([b678ab2](https://github.com/digithun/jamplay-nap/commit/b678ab2))



<a name="1.25.0"></a>
# [1.25.0](https://github.com/digithun/jamplay-nap/compare/v1.23.0...v1.25.0) (2017-12-07)


### Bug Fixes

* **content:** update submodule ([cdecaa9](https://github.com/digithun/jamplay-nap/commit/cdecaa9))
* **graphql.Authen:** add isFirst ([3d08e09](https://github.com/digithun/jamplay-nap/commit/3d08e09))
* **share:** fix share image urls ([01aea5b](https://github.com/digithun/jamplay-nap/commit/01aea5b))
* **share:** fix share path (module content) ([9923666](https://github.com/digithun/jamplay-nap/commit/9923666))


### Features

* **withdraw:** send email when request withdraw ([3a4ac23](https://github.com/digithun/jamplay-nap/commit/3a4ac23))



<a name="1.24.0"></a>
# [1.24.0](https://github.com/digithun/jamplay-nap/compare/v1.23.0...v1.24.0) (2017-11-30)


### Bug Fixes

* **content:** update submodule ([cdecaa9](https://github.com/digithun/jamplay-nap/commit/cdecaa9))
* **graphql.Authen:** add isFirst ([3d08e09](https://github.com/digithun/jamplay-nap/commit/3d08e09))
* **share:** fix share image urls ([01aea5b](https://github.com/digithun/jamplay-nap/commit/01aea5b))
* **share:** fix share path (module content) ([9923666](https://github.com/digithun/jamplay-nap/commit/9923666))


### Features

* **withdraw:** send email when request withdraw ([3a4ac23](https://github.com/digithun/jamplay-nap/commit/3a4ac23))



<a name="1.23.0"></a>
# [1.23.0](https://github.com/digithun/jamplay-nap/compare/v1.22.5...v1.23.0) (2017-11-14)


### Bug Fixes

* **authen:** invalid-argument will throw invalid-login instead ([c644c36](https://github.com/digithun/jamplay-nap/commit/c644c36))
* **authen:** Will lower case and trim email ([8505b15](https://github.com/digithun/jamplay-nap/commit/8505b15))
* **connectors/ewallet:** map error for dataloader ([fe93b6b](https://github.com/digithun/jamplay-nap/commit/fe93b6b))
* **passport-authen:** fillter emailVerified from false to { $ne: true } ([6005f0f](https://github.com/digithun/jamplay-nap/commit/6005f0f))
* **seo:** fix schema ([66a3735](https://github.com/digithun/jamplay-nap/commit/66a3735))


### Features

* **logs:** Add optics ([a8661e9](https://github.com/digithun/jamplay-nap/commit/a8661e9))
* **SEO:** add seo schema & seed ([6a7a840](https://github.com/digithun/jamplay-nap/commit/6a7a840))
* **tracing:** Add tracing (will need new endpoint) ([f880219](https://github.com/digithun/jamplay-nap/commit/f880219))



<a name="1.22.5"></a>
## [1.22.5](https://github.com/digithun/jamplay-nap/compare/v1.22.4...v1.22.5) (2017-10-27)



<a name="1.22.4"></a>
## [1.22.4](https://github.com/digithun/jamplay-nap/compare/v1.22.3...v1.22.4) (2017-10-27)


### Bug Fixes

* **server.initEwallet:** dataloader apply cacheFn ([a195653](https://github.com/digithun/jamplay-nap/commit/a195653))



<a name="1.22.3"></a>
## [1.22.3](https://github.com/digithun/jamplay-nap/compare/1.22.1...1.22.3) (2017-10-27)


### Bug Fixes

* **build:** Add npm install for graphql/content ([9463c23](https://github.com/digithun/jamplay-nap/commit/9463c23))
* **EWALLET:** change api key to access token ([0b2602c](https://github.com/digithun/jamplay-nap/commit/0b2602c))
* **merchant-ewallet:** add accumulate in merchantEwallet ([af29e77](https://github.com/digithun/jamplay-nap/commit/af29e77))


### Performance Improvements

* **EWALLET:** Add app ID for ewallet ([cb4164f](https://github.com/digithun/jamplay-nap/commit/cb4164f)), closes [#JAMP-504](https://github.com/digithun/jamplay-nap/issues/JAMP-504)
