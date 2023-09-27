import type { ReactNode } from 'react';
import React from 'react';
import { get } from 'lodash-es';

const lineReg = /\r\n|\n|\r/;

interface State {
  hasError: boolean;
  stack: string;
  message: string;
}

interface Props {
  children?: ReactNode;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  static displayName = 'ErrorBoundary';

  errorObj: object = { prevErr: null, prevMsg: null };
  state: State = { hasError: false, stack: '', message: '' };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(_: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    const message = get(error, 'message');
    let stack = '';
    const arr = (errorInfo.componentStack || '').replace(/[ ]+/g, ' ').trim().split(lineReg);
    const nArr = [];
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i] || '';
      nArr.push(item);
      if (item.includes('in BasicLayout')) {
        break;
      }
    }
    stack = nArr.join(', ');
    console.log('TCL: ErrorBoundary -> componentDidCatch -> stack', stack);
    this.setState({ stack, message });

    // 判断是否和上一次错误一样
    // if (!is(fromJS(this.errorObj.prevErr), fromJS(error)) || !is(fromJS(this.errorObj.prevMsg), fromJS(message))) {
    //   this.errorObj = {
    //     prevErr: stack,
    //     prevMsg: message,
    //   };
    //   // 记录 url, message, stack

    // }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            color: '#999',
            fontSize: 16,
            padding: '32px 24px',
            background: '#fafafa',
            border: '1px solid #e3e3e3',
            marginBottom: 24,
          }}
        >
          <h4 style={{ fontSize: 15 }}>抱歉, 出现了一些错误。</h4>
          <p>{this.state.message}</p>
          {this.state.stack}
        </div>
      );
    }

    return this.props.children;
  }
}
