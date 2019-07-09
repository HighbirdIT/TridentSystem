const domContainer = document.querySelector('#like_button_container');

class MyE extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            liked:false,
        };
    }
    render(){
        return (
            <button onClick={() => this.setState({ liked: true })}>{this.state.liked ? 'like-f' : 'unlike'}</button>
          );
    }
}

ReactDOM.render(<MyE />, domContainer);
