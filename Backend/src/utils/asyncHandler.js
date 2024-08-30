const asyncHandler = (requestHandler) => {
    return( (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error));
    })
}

export default asyncHandler;


// const asyncHandler = (func) => async(req, res, next) => {
//     try{
//         await func(req, res, next);
//     }
//     catch(error){
//         res.status(error.code || 500);
//     }
// }


// example would be



// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next))
//             .catch((error) => next(error));
//     };
// };

// app.get('/some-route', asyncHandler(async (req, res, next) => {
//     // Simulate an asynchronous operation
//     const result = await someAsyncOperation();
//     res.send(result);
// }));

// // Error handling middleware
// app.use((err, req, res, next) => {
//     res.status(500).send('Something went wrong!');
// });

// app.listen(3000, () => {
//     console.log('Server running on port 3000');
// });
