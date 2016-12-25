package app;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.jar.Manifest;
import java.util.logging.Logger;

import javax.servlet.GenericServlet;
import javax.servlet.Servlet;
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

    /* (non-Javadoc)
     * @see javax.servlet.GenericServlet#init()
     */
    @Override
    public void init() throws ServletException {
        super.init();
        try(InputStream in = getServletContext().getResourceAsStream("META-INF/MANIFEST.MF")) {
            Manifest m = new Manifest(in);
            version = m.getMainAttributes().getValue("Implementation-Version");
        } catch (IOException e) {
            Logger.getGlobal().warning("get version failed.");
            version = "(unknown)";
        }
    }
    
    /* (non-Javadoc)
     * @see javax.servlet.GenericServlet#destroy()
     */
    @Override
    public void destroy() {
        super.destroy();
    }

    /**
     * version
     */
    public String version;
    
    /**
     * @see Servlet#service(ServletRequest request, ServletResponse response)
     */
    public void service(ServletRequest request, ServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain;charset=" + StandardCharsets.UTF_8);
        response.getWriter().println(Message.hello + " " + version);
    }

}
