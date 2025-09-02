# Zero Hunger System - Deployment Guide

## Prerequisites

Before deploying the Zero Hunger System, ensure you have:

1. **Node.js** (version 14 or higher)
2. **MySQL** database server
3. **Git** (for version control)
4. A hosting platform (Heroku, DigitalOcean, AWS, etc.)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd zero-hunger

# Install dependencies
npm install
```

### 2. Database Setup

1. **Install MySQL** on your system
2. **Create the database**:

   ```sql
   mysql -u root -p
   CREATE DATABASE zerohunger_db;
   ```

3. **Run the database schema**:
   ```bash
   mysql -u root -p zerohunger_db < db_setup.sql
   ```

### 3. Environment Configuration

1. **Copy the environment template**:

   ```bash
   cp env.template .env
   ```

2. **Edit `.env` file** with your database credentials:
   ```env
   MYSQL_HOST=127.0.0.1
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password_here
   MYSQL_DATABASE=zerohunger_db
   MYSQL_PORT=3306
   PORT=3000
   NODE_ENV=development
   ```

### 4. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Heroku Deployment

1. **Install Heroku CLI** and login:

   ```bash
   heroku login
   ```

2. **Create a Heroku app**:

   ```bash
   heroku create your-app-name
   ```

3. **Add MySQL addon** (JawsDB or ClearDB):

   ```bash
   heroku addons:create jawsdb:kitefin
   ```

4. **Set environment variables**:

   ```bash
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**:

   ```bash
   git push heroku main
   ```

6. **Run database migrations**:
   ```bash
   heroku run mysql -h <host> -u <user> -p < database < db_setup.sql
   ```

### Option 2: DigitalOcean App Platform

1. **Connect your GitHub repository** to DigitalOcean App Platform
2. **Configure environment variables** in the dashboard
3. **Add MySQL database** service
4. **Deploy** automatically on git push

### Option 3: VPS Deployment (Ubuntu/CentOS)

1. **Install Node.js and MySQL**:

   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm mysql-server

   # CentOS/RHEL
   sudo yum install nodejs npm mysql-server
   ```

2. **Setup MySQL**:

   ```bash
   sudo mysql_secure_installation
   sudo mysql -u root -p < db_setup.sql
   ```

3. **Deploy application**:

   ```bash
   git clone <your-repo>
   cd zero-hunger
   npm install --production
   cp env.template .env
   # Edit .env with production values
   ```

4. **Setup PM2** for process management:

   ```bash
   npm install -g pm2
   pm2 start server.js --name "zero-hunger"
   pm2 startup
   pm2 save
   ```

5. **Setup Nginx** reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Environment Variables

| Variable         | Description       | Default         | Required |
| ---------------- | ----------------- | --------------- | -------- |
| `MYSQL_HOST`     | MySQL server host | `127.0.0.1`     | Yes      |
| `MYSQL_USER`     | MySQL username    | `root`          | Yes      |
| `MYSQL_PASSWORD` | MySQL password    | -               | Yes      |
| `MYSQL_DATABASE` | Database name     | `zerohunger_db` | Yes      |
| `MYSQL_PORT`     | MySQL port        | `3306`          | No       |
| `PORT`           | Server port       | `3000`          | No       |
| `NODE_ENV`       | Environment       | `development`   | No       |

## Security Considerations

1. **Database Security**:

   - Use strong passwords
   - Limit database user permissions
   - Enable SSL connections in production

2. **Application Security**:

   - Keep dependencies updated
   - Use HTTPS in production
   - Implement rate limiting
   - Regular security audits

3. **Server Security**:
   - Keep OS updated
   - Configure firewall
   - Use SSH keys instead of passwords
   - Regular backups

## Monitoring and Maintenance

1. **Logs**: Monitor application logs for errors
2. **Database**: Regular backups and optimization
3. **Performance**: Monitor response times and resource usage
4. **Updates**: Keep dependencies and system updated

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:

   - Check MySQL service is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**:

   - Change PORT in `.env`
   - Kill existing process: `lsof -ti:3000 | xargs kill`

3. **Permission Denied**:
   - Check file permissions
   - Ensure proper user ownership

### Support

For issues and questions:

- Check the logs: `pm2 logs zero-hunger`
- Review error messages in browser console
- Verify environment variables are set correctly

## Backup Strategy

1. **Database Backup**:

   ```bash
   mysqldump -u root -p zerohunger_db > backup_$(date +%Y%m%d).sql
   ```

2. **Application Backup**:
   - Use Git for code versioning
   - Backup uploaded files if any
   - Document configuration changes

## Scaling Considerations

For high-traffic deployments:

1. **Load Balancing**: Use multiple app instances
2. **Database**: Consider read replicas
3. **Caching**: Implement Redis for session storage
4. **CDN**: Use CloudFlare or similar for static assets
5. **Monitoring**: Implement APM tools like New Relic

---

**Note**: This is a basic deployment guide. Adjust configurations based on your specific hosting environment and requirements.
