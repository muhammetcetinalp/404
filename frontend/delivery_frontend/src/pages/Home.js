import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';

const Home = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const role = localStorage.getItem('role');

      switch (role) {
        case 'restaurant_owner':
          navigate('/restaurant-dashboard');
          break;
        case 'customer':
          navigate('/customer-dashboard');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          localStorage.clear();
          break;
      }
    }
  }, [navigate]);

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log('search restaurant:', searchText);
      // navigate('/restaurants', { state: searchText }); 
    }
  };

  return (
    <div className="home-main">
      <div className="container-fluid home-cont1">
        <Header />

        <div className="container home-cont1-text text-white text-center">
          <h1 className="text-uppercase mb-4"><strong>Fastest Route to Your Food<br />Order Now, Eat Happy</strong></h1>
          <div className="container text-white text-center mt-4">
            <div className="col-lg-7 col-md-8 col-sm-12 mx-auto">
              <img style={{ width: "95%" }} alt="" src={require("../assets/images/options-img.png")} />
            </div>
          </div>
        </div>
      </div>

      {/* restaurant, registered user --> information section */}
      <div className="home-info-sec container-fluid py-2 bg-warning-custom text-white text-center ">
        <div className="row">
          <div className="col-lg-4"><p className="my-2"><b className="h5 mr-2">18 </b>Restaurant</p></div>
          <div className="col-lg-4"><p className="my-2"><b className="h5 mr-2">9 </b>People Served</p></div>
          <div className="col-lg-4"><p className="my-2"><b className="h5 mr-2">44 </b>Registered Users</p></div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container-fluid text-center py-4 how-it-works-bg home-main">
        <div className="py-4">
          <h2 className="h2 text-uppercase">How It Works</h2>
          <p>Ordering food has never been easier. Just 3 simple steps!</p>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-4 col-md-4 px-5">
              <span className="round-border my-4">
                <img alt="Choose A Restaurant" src={require("../assets/images/symbolservice.png")} />
              </span>
              <h3 className="h3 mb-4">Choose A Restaurant</h3>
              <p className="mb-4">Browse through your favorite local spots and pick the one that suits your cravings.</p>
            </div>
            <div className="col-12 col-lg-4 col-md-4 px-5">
              <span className="round-border my-4">
                <img alt="Choose A Tasty Dish" src={require("../assets/images/symbolshop.png")} />
              </span>
              <h3 className="h3 mb-4">Choose A Tasty Dish</h3>
              <p className="mb-4">From quick bites to full meals. Select your favorites from the menu.</p>
            </div>
            <div className="col-12 col-lg-4 col-md-4 px-5">
              <span className="round-border my-4">
                <img alt="Pick Up Or Delivery" src={require("../assets/images/symboltransport.png")} />
              </span>
              <h3 className="h3 mb-4">Pick Up Or Delivery</h3>
              <p className="mb-4">Have it delivered to your door or pick it up yourself. It's up to you!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Now */}
      <div className="container-fluid text-center py-5 home-cont3 text-white">
        <h1 className="text-uppercase mb-3">Ready to Eat? We'll Bring It to You.</h1>
        <button className="home-btn text-uppercase" onClick={() => navigate('/login')}>
          <b>Order Now</b>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Home;