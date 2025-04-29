const home = (req, res) => {
    res.render('index', {title: 'Home'});
};

const calendar = (req, res) => {
    res.render('index', {title: 'Calendar'});
};

const schedule = (req, res) => {
    res.render('index', {title: 'Schedule'});
};

const tasks = (req, res) => {
    res.render('index', {title: 'Tasks'});
};

module.exports = {
    home,
    calendar,
    schedule,
    tasks
};