# 📚 PaperGen

✨ Welcome to the PaperGen! This project helps you generate question papers for different subjects, branches, and semesters. It allows you to customize the question paper by selecting questions from the database and generating a formatted Word document.

---

## 🛠 Technologies Used

- **Flask 🧨**: Python web framework for backend development
- **PostgreSQL 🐘**: Production-ready database for storing subjects, questions, and user data
- **Python 🐍**: Core programming language for backend logic
- **JavaScript 💻**: Frontend interactivity
- **HTML/CSS 🎨**: Structuring and styling the UI
- **python-docx 📄**: Generating and downloading Word documents

---

## 📦 Features

- 📄 **Generate Question Papers**: Automatically generate papers based on selected criteria.
- 🔒 **User Authentication**: Signup and login to access tools.
- 📝 **Database Integration**: Questions pulled from PostgreSQL for different subjects and semesters.
- 🖼 **Image Support**: Upload images with questions and include in the generated document.
- 🎯 **RBT Level, CO & PI**: Track question metadata for analysis.
- 📚 **Branch & Semester-based Generation**: Fully customizable paper generation.

---

## 🔧 Installation Instructions

### 1. Clone the Repository:
```bash
git clone https://github.com/vedikapatil27/PaperGen.git
```

### 2. Navigate to the Project Folder:
```bash
cd PaperGen
```

### 3. Install Dependencies:
Make sure you have Python 3.x installed.
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables:
Create a `.env` file in the root directory with the following content (replace with actual values):
```env
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_password
DB_HOST=your_postgres_host
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_DATABASE=question_bank
```

### 5. Run the App:
```bash
python app.py
```

---

## 🚀 How to Use

1. Go to [http://localhost:5000](http://localhost:5000) in your browser.
2. Log in or sign up.
3. Select subject, branch, semester, and exam details.
4. Generate and download the question paper in Word format.

---

## 🌐 Live Demo  
Check out the live version of the app here:  
👉 [Click here to open PaperGen](https://papergen-2ner.onrender.com/) 

---

## 🤝 Contributing
We welcome contributions! If you find bugs or want to enhance features, fork the repository and open a pull request. Make sure your code follows project guidelines.

---

## 📄 License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
