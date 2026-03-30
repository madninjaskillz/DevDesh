import { Component, type ReactNode, type ErrorInfo } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface Props {
  children: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.section ?? 'section'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ my: 1 }}>
          <Box>
            Failed to render {this.props.section ?? 'this section'}.
            <Button
              size="small"
              onClick={() => this.setState({ hasError: false, error: null })}
              sx={{ ml: 1 }}
            >
              Retry
            </Button>
          </Box>
        </Alert>
      );
    }
    return this.props.children;
  }
}
