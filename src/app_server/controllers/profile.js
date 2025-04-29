const login = (req, res) => {
    res.render('index', {title: 'Login'});
};
module.exports = {login};