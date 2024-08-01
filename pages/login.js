import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // استخدم 'login' بدلاً من 'username' لإرسال الطلب
      const response = await axios.post('http://localhost:3000/login', { login: username, password });
      console.log('User logged in with ID:', response.data.id);
      router.push('/');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        console.error('Error logging in:', error);
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleForgotPassword = () => {
    router.push('/reset-password'); // توجه إلى صفحة استعادة كلمة المرور
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card className="shadow-lg">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="mt-3" style={{ direction: 'rtl' }}>تسجيل الدخول إلى Mangaku</h2>
            </div>
            <Form onSubmit={handleSubmit}>
              <Form.Group id="username" className="text-right">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>اسم المستخدم</Form.Label>
                <Form.Control 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  className="mb-3"
                  style={{ direction: 'rtl', textAlign: 'right' }}
                />
              </Form.Group>
              <Form.Group id="password" className="text-right">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>كلمة المرور</Form.Label>
                <Form.Control 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="mb-3"
                  style={{ direction: 'rtl', textAlign: 'right' }}
                />
              </Form.Group>
              <Button className="w-100 btn-primary" type="submit">تسجيل الدخول</Button>
              <Button 
                className="w-100 btn-link mt-3" 
                onClick={handleForgotPassword} 
                variant="link" 
                style={{ color: '#007bff', textDecoration: 'none' }} // إزالة الخط تحت الرابط
              >
                نسيت كلمة السر؟
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Login;
