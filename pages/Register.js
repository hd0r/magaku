import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { useRouter } from 'next/router';
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailExists, setEmailExists] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const router = useRouter();

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length > 0) {
      strength += 10;
      if (password.length >= 8) {
        strength += 15;
        if (password.match(/[a-z]+/)) {
          strength += 25;
        }
        if (password.match(/[A-Z]+/)) {
          strength += 25;
        }
        if (password.match(/[0-9]+/)) {
          strength += 25;
        }
        if (password.match(/[\W]+/)) {
          strength += 25;
        }
      }
    }
    setPasswordStrength(strength);
  };
  const passwordColor = passwordStrength <= 25 ? 'danger' :
    passwordStrength <= 50 ? 'warning' : 'success';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    if (username.length < 4 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('اسم المستخدم يجب أن يكون ٤ أحرف على الأقل ومكون من الأحرف الإنجليزية والأرقام و _ فقط');
      return;
    }
    if (password.length < 8) {
      toast.error('الباسورد يجب أن يكون ٨ أحرف على الأقل');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('البريد الإلكتروني غير صالح');
      return;
    }
    try {
      const response = await axios.post('https://mangako.netlify.app/register', { username, password, email });
      console.log('User registered with ID:', response.data.id);
      router.push('/');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        console.error('Error registering user:', error);
        toast.error('An unexpected error occurred.');
      }
    }
  };
  useEffect(() => {
    const checkEmail = async () => {
      try {
        const response = await axios.get('https://mangako.netlify.app/check-email', { params: { email } });
        setEmailExists(response.data.exists);
      } catch (error) {
        console.error('Error checking email:', error);
      }
    };
    if (email) {
      checkEmail();
    }
  }, [email]);

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const response = await axios.get('https://mangako.netlify.app/check-username', { params: { username } });
        setUsernameExists(response.data.exists);
      } catch (error) {
        console.error('Error checking username:', error);
      }
    };
    if (username) {
      checkUsername();
    }
  }, [username]);

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card className="shadow-lg">
          <Card.Body>
            <div className="text-center mb-4">
              <img src="/logo.png" alt="Mangaku" style={{ width: "100px" }} />
              <h2 className="mt-3" style={{ direction: 'rtl' }}>إنشاء حساب في Mangaku</h2>
            </div>
            <Form onSubmit={handleSubmit}>
              <Form.Group id="username" className="text-right">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>اسم المستخدم</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mb-3"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                  />
                  {username && (usernameExists ? <FaTimes className="input-icon" color="red" /> : <FaCheck className="input-icon" color="green" />)}
                </div>
              </Form.Group>
              <Form.Group id="email" className="text-right">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>البريد الإلكتروني</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mb-3"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                  />
                  {email && (emailExists ? <FaTimes className="input-icon" color="red" /> : <FaCheck className="input-icon" color="green" />)}
                </div>
              </Form.Group>
              <Form.Group id="password" className="text-right">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>كلمة المرور</Form.Label>
                <div className="password-toggle">
                  <Form.Control
                    type={showPassword ? "text" : "password"} // تغيير نوع الحقل بناءً على حالة إظهار كلمة المرور
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    required
                    className="mb-3"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                  />
                  <i onClick={() => setShowPassword(!showPassword)}> {/* تغيير حالة إظهار كلمة المرور */}
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </i>
                </div>
                <ProgressBar
                  now={passwordStrength}
                  variant={passwordStrength <= 25 ? 'danger' : passwordStrength <= 50 ? 'warning' : 'success'}
                  animated // إضافة حركة مستمرة لشريط التقدم
                  label={`${passwordStrength}%`}
                  className="mb-3"
                  style={{ height: '10px' }} // جعل شريط التقدم أكبر
                />
              </Form.Group>
              <Form.Group id="confirmPassword" className="text-right">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>تأكيد كلمة المرور</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mb-3"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                  />
                  {confirmPassword && (password === confirmPassword ? <FaCheck className="input-icon" color="green" /> : <FaTimes className="input-icon" color="red" />)}
                </div>
              </Form.Group>
              <Button className="w-100 btn-primary" type="submit">إنشاء الحساب</Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Register;