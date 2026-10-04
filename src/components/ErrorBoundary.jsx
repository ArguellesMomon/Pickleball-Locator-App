import { Component, Fragment } from "react";

// Catches a crash inside a page so the whole site never goes blank.
// 1st crash on a page: quietly try again (a fresh mount usually works). 2nd crash: show a message.
// Moving to another page (resetKey changes) clears the message.
export default class ErrorBoundary extends Component {
  state = { error: null, attempt: 0 };
  retried = false;

  static getDerivedStateFromError(error) { return { error }; }

  componentDidCatch(error) {
    console.error("Page error:", error); // also visible in the browser console (F12)
    if (!this.retried) {
      this.retried = true;
      this.setState((s) => ({ error: null, attempt: s.attempt + 1 }));
    }
  }

  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey) {
      this.retried = false;
      if (this.state.error) this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page">
          <h1>This page didn't load</h1>
          <p className="muted">{String(this.state.error.message || this.state.error)}</p>
          <button className="btn" onClick={() => window.location.reload()}>Reload the page</button>
        </div>
      );
    }
    return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>;
  }
}
