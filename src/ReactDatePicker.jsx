import { Component, createElement } from "react";

import { HelloWorldSample } from "./components/HelloWorldSample";
import "./ui/ReactDatePicker.css";

export class ReactDatePicker extends Component {
    render() {
        return <HelloWorldSample sampleText={this.props.sampleText} />;
    }
}
