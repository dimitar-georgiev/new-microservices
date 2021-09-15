// sometimes next won't reflect changes in the code base
// the following fixes the issue


// uncomment only if next is giving issues
// module.exports = {
//     webpackDevMiddleware: config => {
//         config.watchOptions.poll = 300;
//         return config;
//     }
// };