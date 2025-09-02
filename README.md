# Zero Hunger System

A web application that helps match food resources (donations, surplus, distribution points) with communities in need, supporting the United Nations Sustainable Development Goal 2: Zero Hunger.

## 🌟 Features

- **Resource Submission**: Easy form for sharing available food resources
- **Admin Dashboard**: View and manage all submitted resources
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant feedback and loading states
- **Security**: Input sanitization and security headers
- **Database Integration**: MySQL backend with connection pooling

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL database server

### Installation

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd zero-hunger
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Setup database**:

   ```bash
   mysql -u root -p < db_setup.sql
   ```

4. **Configure environment**:

   ```bash
   cp env.template .env
   # Edit .env with your database credentials
   ```

5. **Start the server**:

   ```bash
   npm start
   ```

6. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
zero-hunger/
├── public/                 # Static files
│   ├── index.html         # Home page
│   ├── submit.html        # Resource submission form
│   ├── admin.html         # Admin dashboard
│   ├── about.html         # About page
│   ├── contact.html       # Contact information
│   ├── style.css          # Styling
│   ├── submit.js          # Form handling
│   └── admin.js           # Admin functionality
├── server.js              # Main server file
├── db_setup.sql           # Database schema
├── package.json           # Dependencies
├── env.template           # Environment variables template
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=zerohunger_db
MYSQL_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=production
```

### Database Schema

The application uses a single `resources` table with the following structure:

- `id` - Auto-increment primary key
- `name` - Submitter's name
- `phone` - Contact phone number
- `email` - Contact email address
- `location` - Resource location
- `food_type` - Type of food available
- `quantity` - Estimated quantity
- `notes` - Additional notes
- `submitted_at` - Timestamp of submission

## 🌐 API Endpoints

### POST /api/resources

Submit a new food resource.

**Request Body**:

```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "location": "Downtown Food Bank",
  "food_type": "Fresh Vegetables",
  "quantity": "50 lbs",
  "notes": "Available until 5 PM"
}
```

### GET /api/resources

Retrieve all submitted resources (admin use).

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deploy Options

1. **Heroku**: Use the included `package.json` and deploy with Heroku CLI
2. **DigitalOcean**: Use App Platform for easy deployment
3. **VPS**: Follow the VPS deployment guide in DEPLOYMENT.md

## 🔒 Security Features

- Input sanitization and validation
- SQL injection prevention
- XSS protection headers
- CORS configuration
- Path traversal protection
- Graceful error handling

## 🎨 Customization

### Styling

Edit `public/style.css` to customize the appearance.

### Contact Information

Update `public/contact.html` with your organization's details.

### Branding

Modify the header and footer in HTML files to match your organization.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:

- Check the [DEPLOYMENT.md](DEPLOYMENT.md) for troubleshooting
- Review error logs in the console
- Ensure all environment variables are properly set

## 🌍 Impact

This system helps reduce food waste and ensures nutritious food reaches those who need it most. Every resource shared contributes to achieving zero hunger in our communities.

---

**Built with ❤️ for a hunger-free world**
