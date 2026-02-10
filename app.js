import express from 'express';

const app = express();

app.use(cors());
app.use(express.json( { limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10m' }));
app.use(morgan('dev'));

app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'CMS Backend is running' });
});

export default app;
