function CreateNavItemData(text, contentReact){
    return {text:text, content:contentReact};
}

class TabNavBar extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state={
            selectedItem:this.props.navData.selectedItem,
        };
        autoBind(this);
    }

    clickItemBtnHandler(ev){
        var navtext = getAttributeByNode(ev.target, 'navtext');
        if(navtext == null)
        {
            console.warn('navtext is null');
            return;
        }
        this.selectByText(navtext);
    }

    selectByText(text){
        var wantItem = this.props.navData.items.find(item=>{return item.text == text});
        this.setSelect(wantItem);
    }

    setSelect(wantItem){
        if(wantItem == null)
        {
            console.warn('wantItem is null');
            return;
        }

        var nowItem = this.state.selectedItem;
        if(wantItem == nowItem)
            return;
        this.setState({
            selectedItem:wantItem,
        });
        this.props.navData.selectedItem = wantItem;
        this.props.navChanged(nowItem, wantItem);
    }

    render() {
        return (
            <div className="btn-group" projectindex={this.props.index}>
                {
                    this.props.navData.items.map(item => {
                        return (<button key={item.text} navtext={item.text} onClick={this.clickItemBtnHandler} type="button" className={"btn btn-" + (item == this.state.selectedItem ? 'primary' : 'dark')}>
                            {item.text}
                        </button>)
                    })
                }
            </div>
        )
    }
}