import React, { type ErrorInfo, type ReactNode } from 'react';
import { Box, Container, Text, Button, Stack, Alert } from '@mantine/core';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          style={{
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <Container size="sm">
            <Stack gap="md">
              <Alert
                title="⚠️ Something went wrong"
                color="red"
                icon="⚠️"
                withCloseButton={false}
              >
                <Text size="sm" style={{ marginBottom: 12 }}>
                  An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                </Text>
                
                {this.state.error && (
                  <Box
                    style={{
                      backgroundColor: '#fff',
                      padding: '12px',
                      borderRadius: '4px',
                      marginBottom: '12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#e03131',
                      maxHeight: '200px',
                      overflow: 'auto',
                      border: '1px solid #f5222d',
                    }}
                  >
                    <Text component="div" size="xs" style={{ color: '#e03131' }}>
                      {this.state.error.toString()}
                    </Text>
                    {this.state.errorInfo?.componentStack && (
                      <Text
                        component="div"
                        size="xs"
                        style={{ 
                          color: '#999', 
                          marginTop: '8px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {this.state.errorInfo.componentStack}
                      </Text>
                    )}
                  </Box>
                )}
              </Alert>

              <Stack gap="xs">
                <Button
                  onClick={this.handleReset}
                  color="blue"
                  size="md"
                  fullWidth
                >
                  Refresh Page
                </Button>
                <Button
                  variant="light"
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  fullWidth
                >
                  Go to Home
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
