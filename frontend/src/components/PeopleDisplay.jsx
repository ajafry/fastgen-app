import React from 'react';
import { Card, Container, Alert } from 'react-bootstrap';

export const PeopleDisplay = ({ people, loading, error }) => {
    if (loading) {
        return (
            <Container className="mt-4">
                <Alert variant="info">Loading people data...</Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    Error: {error}
                </Alert>
            </Container>
        );
    }

    if (!people || people.length === 0) {
        return null;
    }

    return (
        <Container className="mt-4">
            <h3>People Data</h3>
            <div className="row">
                {people.map((person) => (
                    <div key={person.id} className="col-md-6 col-lg-4 mb-3">
                        <Card>
                            <Card.Body>
                                <Card.Title>{person.firstName} {person.lastName}</Card.Title>
                                <Card.Text>
                                    <strong>Email:</strong> {person.email}<br/>
                                    <strong>Gender:</strong> {person.gender}<br/>
                                    <strong>Date of Birth:</strong> {person.dateOfBirth}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
        </Container>
    );
};