 const githubWebhook = (req, res) => {
    console.log(req.body);
    res.status(200).json({
        success: true,
        message: "Github Webhook received"
    });
};

export default githubWebhook;
