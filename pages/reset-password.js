import React, { useState } from 'react';
import { Container, Form, Button, Card, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const validatePassword = (password) => {
    const strength = password.length >= 8 ? 100 : (password.length / 8) * 100;
    setPasswordStrength(strength);
  };

  const handleSendCode = async () => {
    try {
      await axios.post('http://localhost:3000/send-verification-code', { email }, { withCredentials: true });
      toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
    } catch (error) {
      toast.error('خطأ في إرسال رمز التحقق');
      console.error(error);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('كلمات المرور الجديدة غير متطابقة');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون ٨ أحرف على الأقل');
      return;
    }
    try {
      await axios.post('http://localhost:3000/reset-password', { email, verificationCode, newPassword });
      toast.success('تم تغيير كلمة المرور بنجاح');
      setTimeout(() => {
        router.push('/'); // إعادة التوجيه بعد 2 ثانية
      }, 2000);
    } catch (error) {
      toast.error('خطأ في تغيير كلمة المرور');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card className="shadow-lg">
          <Card.Body>
            <div className="text-center mb-4">
              <img src="/logo.png" alt="Mangaku" style={{ width: "100px" }} />
              <h2 className="mt-3" style={{ direction: 'rtl' }}>استعادة كلمة المرور</h2>
            </div>
            <Form onSubmit={handleResetPassword}>
              <Form.Group id="email" className="text-right">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>البريد الإلكتروني</Form.Label>
                <Form.Control 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="mb-3"
                  style={{ direction: 'rtl', textAlign: 'right' }}
                />
              </Form.Group>
              <Button className="w-100 btn-secondary" onClick={handleSendCode} type="button">إرسال رمز التحقق</Button>
              <Form.Group id="verificationCode" className="text-right mt-3">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>رمز التحقق</Form.Label>
                <Form.Control 
                  type="text" 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value)} 
                  required 
                  className="mb-3"
                  style={{ direction: 'rtl', textAlign: 'right' }}
                />
              </Form.Group>
              <Form.Group id="newPassword" className="text-right">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>كلمة المرور الجديدة</Form.Label>
                <Form.Control 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    validatePassword(e.target.value);
                  }} 
                  required 
                  className="mb-3"
                  style={{ direction: 'rtl', textAlign: 'right' }}
                />
                <ProgressBar now={passwordStrength} label={`${passwordStrength}%`} className="mb-3"/>
              </Form.Group>
              <Form.Group id="confirmNewPassword" className="text-right">
                <Form.Label style={{ display: 'block', textAlign: 'right' }}>تأكيد كلمة المرور الجديدة</Form.Label>
                <Form.Control 
                  type="password" 
                  value={confirmNewPassword} 
                  onChange={(e) => setConfirmNewPassword(e.target.value)} 
                  required 
                  className="mb-3"
                  style={{ direction: 'rtl', textAlign: 'right' }}
                />
              </Form.Group>
              <Button className="w-100 btn-primary" type="submit">تغيير كلمة المرور</Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default ResetPassword;
