package app;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import javax.servlet.GenericServlet;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebServlet;

/**
 * Servlet implementation class Main
 */
@SuppressWarnings("serial")
@WebServlet("/")
public class Main extends GenericServlet {

    /**
     * @see Servlet#service(ServletRequest request, ServletResponse response)
     */
    public void service(ServletRequest request, ServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain;charset=" + StandardCharsets.UTF_8);
        response.getWriter().println("こんにちは");
    }

}
