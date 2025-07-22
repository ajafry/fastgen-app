import { AuthenticatedTemplate } from '@azure/msal-react';
import { NavigationBar } from './NavigationBar.jsx';

export const PageLayout = ({ children }) => {
    return (
        <>
            <NavigationBar />
            <br />
            <h5>
                <center>I am a helpful Chat Assistant</center>
            </h5>
            <br />
            {children}
            <br />
            <AuthenticatedTemplate>
                <footer>
                    <center>
                        How did we do?
                        <a
                            href="https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR_ivMYEeUKlEq8CxnMPgdNZUNDlUTTk2NVNYQkZSSjdaTk5KT1o4V1VVNS4u"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            {' '}
                            Share your experience!
                        </a>
                    </center>
                </footer>
            </AuthenticatedTemplate>
        </>
    );
}