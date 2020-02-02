import React, {Component} from "react";

import '@fortawesome/fontawesome-free/css/all.min.css';
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";

import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBModal,
    MDBModalHeader, 
    MDBModalBody,
    MDBModalFooter
} from 'mdbreact';

class Login extends Component{
    constructor()
    {
        super();
        this.state = {
            enteredEmail : "",
            shouldRedirect : false,
            modal: false,
            modalBodyMessage : ""
        };

        this.handleEmailValue = this.handleEmailValue.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
    }

    handleEmailValue(event){
        this.setState({enteredEmail : event.target.value});
    }

    validateEmail()
    {
        let value = this.state.enteredEmail;
        fetch("/apis/getUserAuthenticate", {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "email": value
            })
        })
        .then(res => res.json())
        .then(result => this.setState({modalBodyMessage : result}, console.log(result)));
        this.setState({
            modal: !this.state.modal
            });
    }
    
    toggle = () => {
        this.setState({
        modal: !this.state.modal
        });
    }

    render()
    {
        return(
            <div>
            <br/><br/>
            <MDBContainer>
                <MDBRow>
                    <MDBCol md="8">
                        <MDBCard>
                            <MDBCardBody>
                                <form>
                                    <p className="h5 text-center-mb-4">
                                        Validate my Email
                                    </p>
                                    <div>
                                        <MDBInput 
                                            label = "Type your email Id"
                                            icon = "envelope" group
                                            type = "email" validate
                                            error = "wrong" 
                                            success = "right"
                                            value = {this.state.value}
                                            onChange = {this.handleEmailValue}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <MDBBtn onClick={this.validateEmail}>Validate</MDBBtn>
                                    </div>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>

                <MDBModal isOpen={this.state.modal} toggle={this.toggle}>
                    <MDBModalHeader toggle={this.toggle}>Varification Status</MDBModalHeader>
                    <MDBModalBody>
                        {this.state.modalBodyMessage["status"] == "fail" ? "Email Id not found" : "Email Id is correct"}
                    </MDBModalBody>
                    <MDBModalFooter>
                        {this.state.modalBodyMessage["status"] == "fail" ? <MDBBtn color="danger" onClick={this.toggle}>Close</MDBBtn> : <MDBBtn color="success" onClick={this.toggle}>Close</MDBBtn>}
                    </MDBModalFooter>
                </MDBModal>

            </MDBContainer>
            </div>
        )
    }
}

export default Login;