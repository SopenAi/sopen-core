
import 'dotenv/config'; 
import express from 'express';
import path from 'path';
import fs from 'fs'; 
import { fileURLToPath } from 'url';
import config from './config/config.js'; 
import { connectDB } from './database/db.js';

import { connectRedis } from './database/cache.js'; 
import { setupAndStartScheduler } from './config/scheduler.js';
import { logSuccess, logError } from './utils/notifier.js';
import { startFileWatcher } from './utils/fileWatcher.js'; 
import { createHomepage } from './website/generator.js'; 

import * as admin from 'firebase-admin';
import publicRoutes from './routes/publicRoutes.js'; 
import userRoutes from './routes/userRoutes.js';   
import adminRoutes from './routes/adminRoutes.js'; 


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEBSITE_PAGES_PATH = path.resolve(__dirname, 'website', 'pages');
const WEBSITE_ASSETS_PATH = path.resolve(__dirname, 'website', 'assets');


if (process.env.FIREBASE_CONFIG_JSON) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            logSuccess('تم تهيئة Firebase Admin SDK بنجاح.', 'FIREBASE_INIT');
        }
    } catch (error) {
        logError('فشل حاسم في تهيئة Firebase Admin SDK (تحقق من FIREBASE_CONFIG_JSON).', error, 'FIREBASE_INIT_FAIL');
    }
} else {
    console.warn('[FIREBASE] تحذير: متغير FIREBASE_CONFIG_JSON مفقود. سيتم تجاهل ميزات المصادقة الإدارية.');
}



async function startServer() {
    logSuccess('جاري بدء تشغيل نظام النشر الذكي (Sopen)...', 'SERVER_INIT');
    
    if (config.MONGODB_URI.includes('localhost') && process.env.NODE_ENV === 'production') {
        logError('⚠️ تحذير: استخدام رابط MongoDB افتراضي في بيئة الإنتاج. تحقق من ملف .env.', null, 'CONFIG_CHECK_FAIL');
    }
    
    try {

        await connectDB();
        
        connectRedis().catch(err => logError('فشل الاتصال بـ Redis. سيستمر الخادم في العمل بدون كاش.', err, 'REDIS_INIT_NON_CRITICAL'));
        
        if (config.RABBITMQ_URI) {
             console.log('[RABBITMQ_DISABLED] تجاوز اتصال RabbitMQ مؤقتاً بسبب أخطاء الأذونات. ستعمل دورة النشر بشكل متزامن وببطء.');
             console.log('[RABBITMQ_DISABLED] لإعادة تفعيل RabbitMQ، قم بإزالة التعليق من connectMQ و startConsumer في server.js.');
             // connectMQ().catch(err => logError('فشل الاتصال بـ RabbitMQ. سيستمر الخادم بالعمل.', err, 'MQ_INIT_NON_CRITICAL'));
             // startConsumer(); 
        }

        
        app.use('/assets', express.static(WEBSITE_ASSETS_PATH));
        app.use('/pages', express.static(WEBSITE_PAGES_PATH));
        app.use(express.json());
        
        app.use('/api', publicRoutes);
        app.use('/api', userRoutes);
        app.use('/api/admin', adminRoutes);

        app.get('/dashboard', (req, res) => { 
             res.sendFile(path.join(WEBSITE_PAGES_PATH, 'dashboard.html'));
        });
        
        app.get('/', async (req, res) => {
            const homepagePath = path.join(WEBSITE_PAGES_PATH, 'index.html'); 
            
            if (!fs.existsSync(homepagePath)) {
                await createHomepage().catch(err => logError('فشل في توليد الصفحة الرئيسية الأولية.', err, 'HOMEPAGE_INIT_FAIL'));
            }

            if (fs.existsSync(homepagePath)) {
                 res.sendFile(homepagePath);
            } else {
                 res.status(503).send('<h1>Sopen</h1><p>جاري تهيئة النظام، يرجى المحاولة لاحقاً.</p>');
            }
           
        });
        
        setupAndStartScheduler(); 
        startFileWatcher();

        const SERVER_PORT = process.env.PORT || config.PORT; 

        app.listen(SERVER_PORT, () => { 
            logSuccess(`🚀 الخادم يعمل على: ${config.HOSTNAME} على منفذ ${SERVER_PORT}`, 'SERVER');
            logSuccess('الجدولة ونظام المراقبة نشطان الآن.', 'SERVER');
            console.log('[RABBITMQ_DISABLED] النشر الآن يتم بشكل متزامن (Direct Publishing).');
            console.log('[REDIS_DISABLED] الكاش غير نشط. يرجى مراجعة سجلات الأخطاء لتصحيح الاتصال.');
        });

    } catch (error) {
        logError('فشل حاسم في بدء تشغيل الخادم.', error, 'SERVER_FAIL');
        process.exit(1);
    }
}

startServer();
