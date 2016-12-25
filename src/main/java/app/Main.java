package app;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.jar.Manifest;
import java.util.logging.Logger;

import javax.activation.MimetypesFileTypeMap;
import javax.servlet.GenericServlet;
import javax.servlet.Servlet;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class Main
 */
@SuppressWarnings("serial")
@WebServlet("/")
public class Main extends GenericServlet {

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.GenericServlet#init()
     */
    @Override
    public void init() throws ServletException {
        Config.startupLog();
        super.init();
    }

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.GenericServlet#destroy()
     */
    @Override
    public void destroy() {
        super.destroy();
        Config.shutdownLog();
    }

    /**
     * version
     */
    public String getVersion() {
        try (InputStream in = getServletContext().getResourceAsStream("META-INF/MANIFEST.MF")) {
            Manifest m = new Manifest(in);
            return m.getMainAttributes().getValue("Implementation-Version");
        } catch (IOException e) {
            Logger.getGlobal().warning("get version failed.");
            return "(unknown)";
        }
    }

    /**
     * @see Servlet#service(ServletRequest request, ServletResponse response)
     */
    public void service(ServletRequest request, ServletResponse response) throws ServletException, IOException {
        ServletContext app = getServletContext();
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        
        /*set http response headers*/
        Config.app_headers.stream().map(i -> i.split(":", 2)).forEach(i -> res.setHeader(i[0], i[1]));

        /*output raw file*/
        String relativePath = req.getRequestURI().substring(app.getContextPath().length() + 1);
        String path = app.getRealPath(relativePath);
        if (!relativePath.isEmpty() && new File(path).exists()) {
            Path p = Paths.get(path);
            String type = MimetypesFileTypeMap.getDefaultFileTypeMap().getContentType(path);
            log(type);
            response.setContentType(type);
            response.getOutputStream().write(Files.readAllBytes(p));
            return;
        }
        
        /*other output*/
        response.setContentType("text/plain;charset=" + StandardCharsets.UTF_8);
        response.getWriter().println(path + " " + Message.hello + " " + getVersion());
    }

}
