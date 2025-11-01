import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Link,
  Button,
} from '@mui/material';
import {
  Email,
  Phone,
  School,
  LocationOn,
} from '@mui/icons-material';

const Contact: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Contact Us
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Email Us
              </Typography>
              <Link href="mailto:studybuddykkw@gmail.com" sx={{ textDecoration: 'none' }}>
                <Typography variant="body1" color="primary">
                  studybuddykkw@gmail.com
                </Typography>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Phone sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Call Us
              </Typography>
              <Link href="tel:+919834735054" sx={{ textDecoration: 'none' }}>
                <Typography variant="body1" color="secondary">
                  +91 9834735054
                </Typography>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <School sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Our College
              </Typography>
              <Button
                variant="contained"
                color="success"
                href="https://www.kkwagh.edu.in/engineering/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 1 }}
              >
                K.K.WAGH Institute
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Get in Touch
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Have questions about Algonix? Need help with coding challenges? 
          We're here to support your learning journey!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Email />}
            href="mailto:studybuddykkw@gmail.com"
            sx={{ minWidth: 200 }}
          >
            Send Email
          </Button>
          <Button
            variant="outlined"
            startIcon={<Phone />}
            href="tel:+919834735054"
            sx={{ minWidth: 200 }}
          >
            Call Now
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Contact;