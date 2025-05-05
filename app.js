"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const http_errors_1 = __importDefault(require("http-errors"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("passport"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const calRoutes_js_1 = __importDefault(require("./src/app_api/routes/calRoutes.js"));
const taskRoutes_js_1 = __importDefault(require("./src/app_api/routes/taskRoutes.js"));
const user_routes_js_1 = __importDefault(require("./src/app_api/routes/user.routes.js"));
const path_2 = require("path");
const url_1 = require("url");
const googleCalService_js_1 = require("./src/app_api/controllers/googleCalService.js");
require("./src/app_api/models/_db.ts");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_2.dirname)(__filename);
const app = (0, express_1.default)();
// view engine setup
app.set('views', path_1.default.join(__dirname, 'src', 'app_server', 'views'));
app.set('view engine', 'pug');
app.use('*', (0, cors_1.default)({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// app.use(function(req: Request, res: Response, next: NextFunction) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PATCH, PUT, DELETE, OPTIONS"
//   );
//   next();
// })
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express_1.default.static(path_1.default.join(__dirname, 'src', 'app_public', 'dist', 'digi-p', 'browser')));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use('/api/auth', user_routes_js_1.default);
app.use('/api/calendar', calRoutes_js_1.default);
app.use('/api/tasks', taskRoutes_js_1.default);
app.get('/api/creds', async (req, res) => {
    try {
        const creds = await (0, googleCalService_js_1.readSavedcreds)();
        res.json(creds);
    }
    catch (err) {
        console.error('credential error: ', err);
        res.status(500).json({ error: 'Failed to load valid credentials' });
    }
});
app.get('*', (req, res, next) => {
    if (req.path !== '/api') {
        res.sendFile(path_1.default.join(__dirname, 'src', 'app_public', 'dist', 'digi-p', 'browser', 'index.html'));
    }
    else {
        next();
    }
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
exports.default = app;
